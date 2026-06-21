import React, { useState, useRef, useCallback } from 'react';
import { CheckCircle, AlertCircle, Send, Mail, Upload, AlertTriangle, XCircle, ArrowRight, FileText, ArrowDown } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import { SITE_CONFIG } from '../constants/site';
import { supabase } from '../lib/supabaseClient';
import { useTurnstile } from '../hooks/useTurnstile';
import {
  parseReceivedChain,
  analyze, parseHeadersFromText, summarize, SLOW_HOP_SECONDS,
} from '@flour-city/email-core';

// ── Analyzer helpers (preserved from EmailAnalyzerView) ──────────────

async function extractHeaders(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'msg') {
    const arrayBuffer = await file.arrayBuffer();
    const { default: MsgReader } = await import('@kenjiuno/msgreader');
    const reader = new MsgReader(new Uint8Array(arrayBuffer));
    const data = reader.getFileData();
    if (!data?.headers?.trim()) {
      throw new Error(
        'This .msg file has no transport headers — it may be a draft or a locally composed message that was never sent through a mail server.'
      );
    }
    return data.headers;
  }

  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = e => resolve(e.target.result);
    fr.onerror = () => reject(new Error('Could not read file'));
    fr.readAsText(file);
  });
}

function ResultBadge({ result }) {
  if (!result) return <span className="text-gray-500 text-sm">—</span>;
  const pass = result === 'pass';
  const neutral = result === 'none' || result === 'neutral' || result === 'bestguesspass';
  const color = pass
    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
    : neutral
    ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
    : 'text-red-400 border-red-400/30 bg-red-400/10';
  return (
    <span className={`inline-block px-2.5 py-0.5 border text-xs font-bold uppercase tracking-wide rounded-sm ${color}`}>
      {result}
    </span>
  );
}

function HopCard({ hop, delta }) {
  const deltaLabel = hop.order === 1 && delta === null
    ? 'origin'
    : delta === null
    ? '?'
    : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}s`;

  const delayed = delta !== null && delta > SLOW_HOP_SECONDS;

  return (
    <div className="border border-white/10 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Hop {hop.order}
        </span>
        <span className={`text-xs font-semibold ${delayed ? 'text-red-400' : 'text-gray-400'}`}>
          {delayed && <AlertTriangle size={11} className="inline mr-1" />}
          {deltaLabel}
        </span>
      </div>
      <div className="grid grid-cols-[52px_1fr] gap-x-5 gap-y-2 text-sm">
        <span className="text-gray-500 font-medium pt-0.5">From</span>
        <span className="text-[#F2F1EF] font-mono text-base break-all leading-snug">
          {hop.from ? `${hop.from}${hop.fromIp ? ` [${hop.fromIp}]` : ''}` : <span className="text-gray-600 italic text-sm">not present</span>}
        </span>
        <span className="text-gray-500 font-medium pt-0.5">By</span>
        <span className="text-[#F2F1EF] font-mono text-base break-all leading-snug">{hop.by || <span className="text-gray-600 italic text-sm">not present</span>}</span>
        <span className="text-gray-500 font-medium pt-0.5">Via</span>
        <span className="text-[#F2F1EF] font-mono text-base">{hop.with || <span className="text-gray-600 italic text-sm">not present</span>}</span>
        <span className="text-gray-500 font-medium pt-0.5">Time</span>
        <span className="text-gray-300 font-mono text-sm">{hop.timestampRaw || <span className="text-gray-600 italic">not present</span>}</span>
      </div>
    </div>
  );
}

function AuthSection({ authResults }) {
  if (authResults.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic">No Authentication-Results headers found.</p>
    );
  }
  return (
    <div className="space-y-4">
      {authResults.map((auth, i) => (
        <div key={i} className="border border-white/10 p-5 space-y-4">
          <p className="text-sm font-medium text-gray-300 font-mono">{auth.reporter}</p>
          <div className="flex flex-wrap gap-6">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">DKIM</p>
              {auth.dkim.length > 0
                ? auth.dkim.map((d, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <ResultBadge result={d.result} />
                      {d.domain && <span className="text-sm text-gray-300 font-mono">{d.domain}</span>}
                    </div>
                  ))
                : <span className="text-gray-500 text-sm italic">not checked</span>
              }
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">SPF</p>
              <ResultBadge result={auth.spf?.result} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">DMARC</p>
              <div className="flex items-center gap-2">
                <ResultBadge result={auth.dmarc?.result} />
                {auth.dmarc?.policy && (
                  <span className="text-sm text-gray-300 font-mono">p={auth.dmarc.policy}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main View ────────────────────────────────────────────────────────

const EmailView = () => {
    // ── Checkup form state ───────────────────────────────────────────
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        domain: '',
        notes: '',
        _honeypot: '',
    });
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const { execute: executeTurnstile, reset: resetTurnstile, containerRef: turnstileRef } = useTurnstile();

    // ── Analyzer state ───────────────────────────────────────────────
    const [analyzerResult, setAnalyzerResult] = useState(null);
    const [analyzerError, setAnalyzerError] = useState(null);
    const [analyzerLoading, setAnalyzerLoading] = useState(false);
    const [fileName, setFileName] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [pasteText, setPasteText] = useState('');
    const inputRef = useRef(null);

    // ── Scroll refs ──────────────────────────────────────────────────
    const checkupFormRef = useRef(null);
    const analyzerRef = useRef(null);

    const scrollToCheckup = () => {
        checkupFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const scrollToAnalyzer = () => {
        analyzerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ── Checkup form handler ─────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData._honeypot) {
            setStatus('success');
            return;
        }

        setStatus('loading');

        const turnstileToken = await executeTurnstile();
        if (!turnstileToken) {
            setErrorMessage('Security verification failed. Please try again.');
            setStatus('error');
            return;
        }

        try {
            const message = `[Email Checkup Request]\nDomain: ${formData.domain}${formData.notes ? `\n\n${formData.notes}` : ''}`;

            const { data: contact, error } = await supabase
                .from('contacts')
                .insert({ name: formData.name, email: formData.email, message })
                .select()
                .single();

            if (error) throw error;

            const { error: funcError } = await supabase.functions.invoke('send-notification', {
                body: { record: contact, table: 'contacts', type: 'INSERT', turnstile_token: turnstileToken },
            });

            if (funcError) throw new Error(`Notification failed: ${funcError.message}`);

            setStatus('success');
            setFormData({ name: '', email: '', domain: '', notes: '', _honeypot: '' });
            resetTurnstile();
        } catch (err) {
            console.error('Checkup submission error:', err.message);
            setErrorMessage(`Something went wrong. Try again or email me at ${SITE_CONFIG.email}.`);
            setStatus('error');
        }
    };

    // ── Analyzer handlers ────────────────────────────────────────────
    const runAnalysis = useCallback((rawText, label, inputType) => {
        try {
            const { headers, raw } = parseHeadersFromText(rawText);
            const hops = parseReceivedChain(raw);
            if (hops.length === 0) throw new Error('No Received headers found. Make sure you pasted the full email headers, not just the body.');
            const analysis = analyze(headers, hops);
            setFileName(label);
            setAnalyzerResult({ hops, analysis });

            const fromHdr = headers.find(h => h.name.toLowerCase() === 'from');
            const fromDomain = fromHdr
                ? (fromHdr.value.match(/@([^>\s]+)/) || [])[1]?.toLowerCase() ?? null
                : null;
            const firstAuth = analysis.authResults[0];
            supabase.from('email_audits').insert({
                input_type:   inputType,
                hop_count:    hops.length,
                from_domain:  fromDomain,
                flags:        analysis.flags,
                spf_result:   firstAuth?.spf?.result ?? null,
                dkim_result:  firstAuth?.dkim[0]?.result ?? null,
                dmarc_result: firstAuth?.dmarc?.result ?? null,
                dmarc_policy: firstAuth?.dmarc?.policy ?? null,
            }).then(() => {});
        } catch (err) {
            setAnalyzerError(err.message);
        } finally {
            setAnalyzerLoading(false);
        }
    }, []);

    const processFile = useCallback(async (file) => {
        if (!file) return;
        setAnalyzerLoading(true);
        setAnalyzerError(null);
        setAnalyzerResult(null);
        setPasteText('');
        try {
            const rawText = await extractHeaders(file);
            runAnalysis(rawText, file.name, 'file');
        } catch (err) {
            setAnalyzerError(err.message);
            setAnalyzerLoading(false);
        }
    }, [runAnalysis]);

    const processPaste = () => {
        if (!pasteText.trim()) return;
        setAnalyzerLoading(true);
        setAnalyzerError(null);
        setAnalyzerResult(null);
        runAnalysis(pasteText, 'pasted headers', 'paste');
    };

    const onFileChange = (e) => {
        processFile(e.target.files[0]);
        e.target.value = '';
    };

    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        processFile(e.dataTransfer.files[0]);
    };

    const resetAnalyzer = () => {
        setAnalyzerResult(null);
        setAnalyzerError(null);
        setFileName(null);
        setPasteText('');
    };

    const deltaMap = analyzerResult ? new Map(analyzerResult.analysis.hopDeltas.map(d => [d.order, d.delta])) : null;
    const hasFlags = analyzerResult?.analysis.flags.length > 0;
    const verdict = analyzerResult ? summarize({ flags: analyzerResult.analysis.flags }) : { fails: [], warns: [] };

    return (
        <div className="animate-in fade-in duration-700">
            {/* Header Section */}
            <section className="relative pt-40 pb-24 overflow-hidden bg-[#1A1B1E] text-[#F2F1EF]">
                <div className="absolute inset-0 z-0 opacity-10">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="absolute border-t border-slate-500 w-full" style={{ top: `${i * 5}%`, transform: `skewY(-2deg)` }}></div>
                    ))}
                </div>
                <div className="relative z-20 max-w-7xl mx-auto px-6">
                    <header className="space-y-12 text-left">
                        <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Email Deliverability</span>
                        <DimensionedHeader line1="EMAIL" line2="DELIVERABILITY." layerHt="SPF·DMARC" partWd="CNAME·MX" variant="dark" showUnits={false} />
                        <p className="text-gray-400 max-w-2xl font-medium leading-relaxed text-lg text-left">
                            Your customers can't pay invoices they never received. If your email is landing in spam — or not arriving at all — the problem is almost always in your DNS records. I check the things that quietly break email delivery, find what's wrong, and fix it.
                        </p>
                    </header>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-[#F2F1EF] text-[#1A1B1E]">
                <div className="max-w-7xl mx-auto px-6">

                {/* ── Section 2: What I Check + Sidebar CTA ───────────── */}
                <div className="grid lg:grid-cols-3 gap-12 mb-24">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-10 text-left">
                        <div className="space-y-2">
                            <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block border-l-2 border-[#D4A017] pl-4">What I check</span>
                            <h2 className="font-display text-4xl font-black uppercase italic tracking-tighter">Under the hood.</h2>
                        </div>

                        <p className="text-gray-500 font-medium leading-relaxed text-lg">
                            It's easy to overlook these records until a customer says they never got the invoice. Here's what I look at:
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                {
                                    title: 'SPF',
                                    desc: 'Tells receiving servers which IP addresses are allowed to send email on your behalf. A missing or misconfigured SPF record is the #1 reason mail hits spam.',
                                },
                                {
                                    title: 'DKIM',
                                    desc: 'A cryptographic signature that proves an email wasn\'t altered in transit. Without it, your messages look unverified.',
                                },
                                {
                                    title: 'DMARC',
                                    desc: 'Your email policy: what should happen when SPF or DKIM fails? Without DMARC, you\'re leaving that decision to every receiving server.',
                                },
                                {
                                    title: 'MX Records',
                                    desc: 'The DNS entries that route mail to your inbox. Broken MX records mean inbound mail silently disappears.',
                                },
                                {
                                    title: 'Blacklist Status',
                                    desc: 'If your domain or IP is on a blacklist, your email gets rejected before it\'s even read. I check the major lists.',
                                },
                            ].map((item) => (
                                <div key={item.title} className="p-6 bg-[#EAE8E4] border border-gray-300 rounded-sm space-y-2">
                                    <h3 className="font-display text-lg font-black uppercase italic tracking-tighter">{item.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        <p className="text-gray-500 font-medium leading-relaxed text-lg">
                            Enter your domain and I'll check the things that quietly send your email to spam: SPF, DKIM, DMARC, MX records, and whether you're on any blacklists. I'll email you what's broken and how to fix it. The first look is free. If you want me to fix the issues, we can discuss the scope and cost.
                        </p>
                    </div>

                    {/* Sidebar CTAs — sticky on desktop */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="lg:sticky lg:top-28 space-y-6">
                            {/* Primary CTA — Request a checkup */}
                            <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-4">
                                <div className="flex items-center gap-3 text-[#D4A017]">
                                    <Mail size={18} />
                                    <h4 className="text-sm font-black uppercase tracking-widest italic text-white">Ready for a checkup?</h4>
                                </div>
                                <ul className="space-y-2 text-xs font-medium text-slate-400 leading-relaxed">
                                    {['SPF record validity', 'DKIM key configuration', 'DMARC policy and alignment', 'MX record health', 'Blacklist status'].map((item) => (
                                        <li key={item} className="flex items-center gap-2">
                                            <CheckCircle size={11} className="text-[#D4A017] shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-2 border-t border-white/10 space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">Free · Results in 24h</p>
                                </div>
                                <button
                                    onClick={scrollToCheckup}
                                    className="w-full py-4 bg-[#D4A017] text-[#1A1B1E] font-black uppercase text-[10px] tracking-[0.3em] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                                >
                                    Request checkup <ArrowDown size={12} />
                                </button>
                            </section>

                            {/* Secondary CTA — Try the analyzer */}
                            <section className="bg-[#EAE8E4] border border-gray-300 p-6 rounded-sm space-y-3 text-left">
                                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">Or try it yourself</p>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed">Have a saved .eml or .msg file? Run it through the analyzer for an instant header breakdown.</p>
                                <button onClick={scrollToAnalyzer} className="text-[10px] font-black uppercase tracking-widest text-[#1A1B1E] hover:text-[#D4A017] transition-colors flex items-center gap-1.5">
                                    Jump to analyzer <ArrowDown size={10} />
                                </button>
                            </section>
                        </div>
                    </div>
                </div>

                {/* ── Section 3: Self-Serve Analyzer (dark embed) ─────── */}
                <section ref={analyzerRef} className="mb-24 bg-[#1A1B1E] rounded-sm p-8 md:p-12 text-[#F2F1EF] scroll-mt-28">
                    <div className="max-w-3xl mx-auto space-y-10">

                        {/* Analyzer header */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">Self-Serve Tool</p>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-[#F2F1EF] leading-none">
                                Email Analyzer
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
                                Upload a <span className="relative group inline-block cursor-help">
                                    <code className="text-[#D4A017] font-mono text-sm border-b border-dashed border-[#D4A017]/50">.eml</code>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-[#EAE8E4] text-[#1A1B1E] text-xs font-medium leading-relaxed rounded-sm shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center">
                                        You can upload a file if you have one, paste a header, or just email me from your domain address and I'll figure it all out.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#EAE8E4]"></div>
                                    </div>
                                </span> or{' '}
                                <span className="relative group inline-block cursor-help">
                                    <code className="text-[#D4A017] font-mono text-sm border-b border-dashed border-[#D4A017]/50">.msg</code>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-[#EAE8E4] text-[#1A1B1E] text-xs font-medium leading-relaxed rounded-sm shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center">
                                        You can upload a file if you have one, paste a header, or just email me from your domain address and I'll figure it all out.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#EAE8E4]"></div>
                                    </div>
                                </span> file, or paste raw headers.
                                I'll parse the Received chain, check DKIM, SPF, and DMARC, and flag anything suspicious.
                            </p>
                        </div>

                        {/* Primary CTA — email-in flow */}
                        <a
                            href="mailto:analyze@flourcitylabs.com?subject=Header Analysis Request&body=Just hit send and you'll get your deliverability report in a few minutes!"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(e.currentTarget.href, '_blank');
                            }}
                            className="flex items-start gap-5 p-7 bg-[#D4A017] text-[#1A1B1E] rounded-sm hover:bg-amber-400 transition-colors group"
                          >
                            <Mail size={28} className="shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-black text-lg uppercase tracking-tight leading-tight">Send me an email from your business address</p>
                              <p className="text-sm font-medium leading-relaxed opacity-80">
                                I'll check your headers, SPF, DKIM, DMARC, and MX records, then reply with a plain-English report within minutes. No file needed — just hit send.
                              </p>
                              <p className="text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-1.5">
                                analyze<span style={{display:'none'}}>nospam</span>@flourcitylabs.com <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                              </p>
                            </div>
                          </a>

                        {/* Secondary input — upload or paste */}
                        {!analyzerResult && !analyzerError && (
                          <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Or analyze a saved file</p>
                            {/* Drop zone */}
                            <div
                              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                              onDragLeave={() => setDragging(false)}
                              onDrop={onDrop}
                              onClick={() => inputRef.current?.click()}
                              className={`border-2 border-dashed rounded-sm p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
                                dragging ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-white/15 hover:border-[#D4A017]/50 hover:bg-white/5'
                              }`}
                            >
                              <input ref={inputRef} type="file" accept=".eml,.msg" className="hidden" onChange={onFileChange} />
                              {analyzerLoading ? (
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                                  <p className="text-sm text-gray-400">Analyzing {fileName}</p>
                                </div>
                              ) : (
                                <>
                                  <Upload size={28} className="text-gray-600" />
                                  <div className="text-center space-y-1.5">
                                    <p className="text-base font-semibold text-gray-300">
                                      Drop a file here or click to browse
                                    </p>
                                    <p className="text-sm text-gray-500">.eml · .msg</p>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4">
                              <div className="flex-1 h-px bg-white/10" />
                              <span className="text-sm text-gray-500">or</span>
                              <div className="flex-1 h-px bg-white/10" />
                            </div>

                            {/* Paste area */}
                            <div className="space-y-2">
                              <textarea
                                value={pasteText}
                                onChange={e => setPasteText(e.target.value)}
                                placeholder="Paste raw email headers here..."
                                rows={6}
                                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm font-mono text-[#F2F1EF] placeholder-gray-600 focus:outline-none focus:border-[#D4A017]/50 resize-y"
                              />
                              <button
                                onClick={processPaste}
                                disabled={!pasteText.trim()}
                                className="px-6 py-2.5 bg-[#D4A017] text-[#1A1B1E] font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                              >
                                Analyze
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Error state */}
                        {analyzerError && (
                          <div className="border border-red-500/30 bg-red-500/5 p-6 space-y-4">
                            <div className="flex items-start gap-3">
                              <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-red-400">Parse Error</p>
                                <p className="text-sm text-gray-300 leading-relaxed">{analyzerError}</p>
                              </div>
                            </div>
                            <button onClick={resetAnalyzer} className="text-sm text-gray-500 hover:text-[#D4A017] transition-colors">
                              Try another file
                            </button>
                          </div>
                        )}

                        {/* Results */}
                        {analyzerResult && (
                          <div className="space-y-10">
                            {/* File + summary bar */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                              <div className="flex items-center gap-3">
                                <FileText size={16} className="text-[#D4A017]" />
                                <span className="text-sm font-mono text-[#F2F1EF]">{fileName}</span>
                                <span className="text-sm text-gray-500">
                                  {analyzerResult.hops.length} hop{analyzerResult.hops.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                {hasFlags
                                  ? <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                                      <AlertTriangle size={13} /> {analyzerResult.analysis.flags.length} flag{analyzerResult.analysis.flags.length !== 1 ? 's' : ''}
                                    </span>
                                  : <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                                      <CheckCircle size={13} /> Clean
                                    </span>
                                }
                                <button onClick={resetAnalyzer} className="text-sm text-gray-500 hover:text-[#D4A017] transition-colors">
                                  Clear
                                </button>
                              </div>
                            </div>

                            {/* Received Chain */}
                            <section className="space-y-4">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                                Received Chain
                              </h3>
                              <div className="space-y-2">
                                {analyzerResult.hops.map((hop, i) => (
                                  <React.Fragment key={hop.order}>
                                    <HopCard hop={hop} delta={deltaMap.get(hop.order)} />
                                    {i < analyzerResult.hops.length - 1 && (
                                      <div className="flex justify-center py-1">
                                        <ArrowRight size={14} className="text-white/20 rotate-90" />
                                      </div>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </section>

                            {/* Authentication */}
                            <section className="space-y-4">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                                Authentication Results
                              </h3>
                              <AuthSection authResults={analyzerResult.analysis.authResults} />
                            </section>

                            {/* Flags */}
                            <section className="space-y-4">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                                Flags
                              </h3>
                              {hasFlags ? (
                                <div className="space-y-4">
                                  {verdict.fails.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-bold uppercase tracking-widest text-red-400">Needs attention</p>
                                      {verdict.fails.map((flag, i) => (
                                        <div key={`fail-${i}`} className="flex items-start gap-3 border border-red-500/20 bg-red-500/5 p-4">
                                          <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                                          <span className="text-sm text-red-300 font-mono">{flag}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {verdict.warns.length > 0 && (
                                    <div className="space-y-2">
                                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-400">Worth improving</p>
                                      {verdict.warns.map((flag, i) => (
                                        <div key={`warn-${i}`} className="flex items-start gap-3 border border-amber-500/20 bg-amber-500/5 p-4">
                                          <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                                          <span className="text-sm text-amber-300 font-mono">{flag}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/5 p-4">
                                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                                  <span className="text-sm text-emerald-300">No issues detected</span>
                                </div>
                              )}
                            </section>

                            {/* Reset */}
                            <div className="flex justify-center pt-2">
                              <button
                                onClick={resetAnalyzer}
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#D4A017] transition-colors"
                              >
                                <Upload size={13} /> Analyze another file
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                </section>

                {/* ── Section 4: Checkup Request Form ─────────────────── */}
                <section ref={checkupFormRef} className="scroll-mt-28">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-10 text-left">
                            <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-4">
                                <div className="flex items-center gap-3 text-[#D4A017]">
                                    <Mail size={18} />
                                    <h4 className="text-sm font-black uppercase tracking-widest italic text-white">What I check</h4>
                                </div>
                                <ul className="space-y-2 text-xs font-medium text-slate-400 leading-relaxed">
                                    {['SPF record validity', 'DKIM key configuration', 'DMARC policy and alignment', 'MX record health', 'Blacklist status'].map((item) => (
                                        <li key={item} className="flex items-center gap-2">
                                            <CheckCircle size={11} className="text-[#D4A017] shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">First checkup free</p>
                                </div>
                            </section>
                        </div>

                        {/* Form */}
                        <div className="lg:col-span-2 bg-[#EAE8E4] border border-gray-300 p-10 md:p-14 rounded-sm shadow-2xl">
                            {status === 'success' ? (
                                <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                                        <CheckCircle size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-display font-black uppercase tracking-tighter">Got it.</p>
                                        <p className="text-sm text-gray-500 italic">I'll run the checks and email you within 24 hours.</p>
                                    </div>
                                    <button onClick={() => setStatus('idle')} className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017] hover:underline">
                                        Submit another request
                                    </button>
                                </div>
                            ) : (
                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    <div className="space-y-2 mb-8">
                                        <h3 className="font-display text-3xl font-black uppercase italic tracking-tighter">Request your checkup</h3>
                                        <p className="text-gray-500 text-sm font-medium">I just need your domain. Everything else is optional.</p>
                                    </div>

                                    {/* Honeypot */}
                                    <input type="text" name="_honeypot" style={{ display: 'none' }} tabIndex="-1" autoComplete="off"
                                        value={formData._honeypot} onChange={(e) => setFormData({ ...formData, _honeypot: e.target.value })} />

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Full name" required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                        <input type="email" placeholder="Email address" required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>

                                    <input type="text" placeholder="Your domain (e.g. yourbusiness.com)" required
                                        className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all font-mono"
                                        value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} />

                                    <textarea placeholder="Anything else I should know? (optional)"
                                        className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all h-28 resize-none"
                                        value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />

                                    {status === 'error' && (
                                        <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-tighter">
                                            <AlertCircle size={14} />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-start py-2">
                                        <div ref={turnstileRef}></div>
                                    </div>

                                    <button type="submit" disabled={status === 'loading'}
                                        className="w-full py-5 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                        <span>{status === 'loading' ? 'Sending...' : 'Request checkup'}</span>
                                        {status !== 'loading' && <Send size={14} />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

            </div>
        </section>
    </div>
    );
};

export default EmailView;
