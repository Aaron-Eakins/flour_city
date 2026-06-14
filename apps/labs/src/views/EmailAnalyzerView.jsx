import React, { useState, useRef, useCallback } from 'react';
import { Upload, AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight, FileText, Mail } from 'lucide-react';
import { parseReceivedChain, splitHeaders, unfoldHeaders } from '../lib/email/parser.js';
import { analyze, parseHeadersFromText } from '../lib/email/analyzer.js';
import { supabase } from '../lib/supabaseClient.js';

// Reads an .eml or .msg file and returns the raw header text string.
// .msg parsing uses @kenjiuno/msgreader loaded dynamically to avoid SSR issues.
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

  // .eml or unknown: read as text
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

  const delayed = delta !== null && delta > 60;

  return (
    <div className="border border-white/10 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Hop {hop.order}
        </span>
        <span className={`text-xs font-mono font-semibold ${delayed ? 'text-red-400' : 'text-gray-400'}`}>
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

export default function EmailAnalyzerView({ setView }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const inputRef = useRef(null);

  const runAnalysis = useCallback((rawText, label, inputType) => {
    try {
      const { headers, raw } = parseHeadersFromText(rawText);
      const hops = parseReceivedChain(raw);
      if (hops.length === 0) throw new Error('No Received headers found. Make sure you pasted the full email headers, not just the body.');
      const analysis = analyze(headers, hops);
      setFileName(label);
      setResult({ hops, analysis });

      // Save metadata to Supabase — fire and forget, never blocks UI
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setPasteText('');
    try {
      const rawText = await extractHeaders(file);
      runAnalysis(rawText, file.name, 'file');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [runAnalysis]);

  const processPaste = () => {
    if (!pasteText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
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

  const reset = () => {
    setResult(null);
    setError(null);
    setFileName(null);
    setPasteText('');
  };

  const deltaMap = result ? new Map(result.analysis.hopDeltas.map(d => [d.order, d.delta])) : null;
  const hasFlags = result?.analysis.flags.length > 0;

  return (
    <div className="min-h-screen bg-[#1A1B1E] pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">Email Deliverability</p>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-[#F2F1EF] leading-none">
            Email Analyzer
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
            Upload a <code className="text-[#D4A017] font-mono text-sm">.eml</code> or{' '}
            <code className="text-[#D4A017] font-mono text-sm">.msg</code> file, or paste raw headers.
            I'll parse the Received chain, check DKIM, SPF, and DMARC, and flag anything suspicious.
          </p>
        </div>

        {/* Primary CTA — email-in flow */}
        {!result && !error && (
          <a
            href="mailto:analyze@flourcitylabs.com?subject=Header Analysis Request"
            className="flex items-start gap-5 p-7 bg-[#D4A017] text-[#1A1B1E] rounded-sm hover:bg-amber-400 transition-colors group"
          >
            <Mail size={28} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-black text-lg uppercase tracking-tight leading-tight">Send me an email from your business address</p>
              <p className="text-sm font-medium leading-relaxed opacity-80">
                I'll check your headers, SPF, DKIM, DMARC, and MX records, then reply with a plain-English report within minutes. No file needed — just hit send.
              </p>
              <p className="text-xs font-black uppercase tracking-widest mt-2 flex items-center gap-1.5">
                analyze@flourcitylabs.com <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </p>
            </div>
          </a>
        )}

        {/* Secondary input — upload or paste */}
        {!result && !error && (
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
              {loading ? (
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
        </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-400">Parse Error</p>
                <p className="text-sm text-gray-300 leading-relaxed">{error}</p>
              </div>
            </div>
            <button onClick={reset} className="text-sm text-gray-500 hover:text-[#D4A017] transition-colors">
              Try another file
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-10">
            {/* File + summary bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-[#D4A017]" />
                <span className="text-sm font-mono text-[#F2F1EF]">{fileName}</span>
                <span className="text-sm text-gray-500">
                  {result.hops.length} hop{result.hops.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {hasFlags
                  ? <span className="flex items-center gap-1.5 text-sm font-semibold text-red-400">
                      <AlertTriangle size={13} /> {result.analysis.flags.length} flag{result.analysis.flags.length !== 1 ? 's' : ''}
                    </span>
                  : <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                      <CheckCircle size={13} /> Clean
                    </span>
                }
                <button onClick={reset} className="text-sm text-gray-500 hover:text-[#D4A017] transition-colors">
                  Clear
                </button>
              </div>
            </div>

            {/* Received Chain */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                Received Chain
              </h2>
              <div className="space-y-2">
                {result.hops.map((hop, i) => (
                  <React.Fragment key={hop.order}>
                    <HopCard hop={hop} delta={deltaMap.get(hop.order)} />
                    {i < result.hops.length - 1 && (
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
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                Authentication Results
              </h2>
              <AuthSection authResults={result.analysis.authResults} />
            </section>

            {/* Flags */}
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D4A017]">
                Flags
              </h2>
              {hasFlags ? (
                <div className="space-y-2">
                  {result.analysis.flags.map((flag, i) => (
                    <div key={i} className="flex items-start gap-3 border border-red-500/20 bg-red-500/5 p-4">
                      <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-red-300 font-mono">{flag}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                  <span className="text-sm text-emerald-300">No issues detected</span>
                </div>
              )}
            </section>

            {/* CTA */}
            <div className="border border-[#D4A017]/30 bg-[#D4A017]/5 p-8 space-y-4">
              <h3 className="text-base font-bold text-[#F2F1EF]">
                Want the full picture?
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                This tool reads one email's headers. A full checkup goes deeper — SPF inspection,
                DKIM key review, DMARC policy, blacklist checks, and a plain-English fix list
                you can actually act on.
              </p>
              <button
                onClick={() => setView('email-checkup')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A017] text-[#1A1B1E] font-bold text-sm hover:scale-[1.02] transition-transform"
              >
                Book a free checkup <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
