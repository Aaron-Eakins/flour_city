import React, { useState, useRef, useCallback } from 'react';
import { Upload, AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight, FileText } from 'lucide-react';
import { parseReceivedChain, splitHeaders, unfoldHeaders } from '../lib/email/parser.js';
import { analyze, parseHeadersFromText } from '../lib/email/analyzer.js';

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
  if (!result) return <span className="text-gray-500 text-xs uppercase tracking-widest">—</span>;
  const pass = result === 'pass';
  const neutral = result === 'none' || result === 'neutral' || result === 'bestguesspass';
  const color = pass
    ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
    : neutral
    ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
    : 'text-red-400 border-red-400/30 bg-red-400/10';
  return (
    <span className={`inline-block px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest rounded-sm ${color}`}>
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
    <div className="border border-white/10 p-5 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
          Hop {hop.order}
        </span>
        <span className={`text-[10px] font-mono font-bold tracking-wider ${delayed ? 'text-red-400' : 'text-gray-400'}`}>
          {delayed && <AlertTriangle size={10} className="inline mr-1" />}
          {deltaLabel}
        </span>
      </div>
      <div className="grid grid-cols-[80px_1fr] gap-x-4 gap-y-1 text-xs">
        <span className="text-gray-500 font-bold uppercase tracking-wider">From</span>
        <span className="text-[#F2F1EF] font-mono break-all">
          {hop.from ? `${hop.from}${hop.fromIp ? ` [${hop.fromIp}]` : ''}` : <span className="text-gray-600 italic">not present</span>}
        </span>
        <span className="text-gray-500 font-bold uppercase tracking-wider">By</span>
        <span className="text-[#F2F1EF] font-mono break-all">{hop.by || <span className="text-gray-600 italic">not present</span>}</span>
        <span className="text-gray-500 font-bold uppercase tracking-wider">Via</span>
        <span className="text-[#F2F1EF] font-mono">{hop.with || <span className="text-gray-600 italic">not present</span>}</span>
        <span className="text-gray-500 font-bold uppercase tracking-wider">Time</span>
        <span className="text-gray-400 font-mono text-[11px]">{hop.timestampRaw || <span className="text-gray-600 italic">not present</span>}</span>
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
        <div key={i} className="border border-white/10 p-5 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{auth.reporter}</p>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">DKIM</p>
              {auth.dkim.length > 0
                ? auth.dkim.map((d, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <ResultBadge result={d.result} />
                      {d.domain && <span className="text-[11px] text-gray-400 font-mono">{d.domain}</span>}
                    </div>
                  ))
                : <span className="text-gray-600 text-xs italic">not checked</span>
              }
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">SPF</p>
              <ResultBadge result={auth.spf?.result} />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">DMARC</p>
              <div className="flex items-center gap-2">
                <ResultBadge result={auth.dmarc?.result} />
                {auth.dmarc?.policy && (
                  <span className="text-[11px] text-gray-400 font-mono">p={auth.dmarc.policy}</span>
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
  const inputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFileName(file.name);
    try {
      const rawText = await extractHeaders(file);
      const { headers, raw } = parseHeadersFromText(rawText);
      const hops = parseReceivedChain(raw);
      const analysis = analyze(headers, hops);
      setResult({ hops, analysis });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

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
  };

  const deltaMap = result ? new Map(result.analysis.hopDeltas.map(d => [d.order, d.delta])) : null;
  const hasFlags = result?.analysis.flags.length > 0;

  return (
    <div className="min-h-screen bg-[#1A1B1E] pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017]">Email Deliverability</p>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#F2F1EF] leading-none">
            Header Analyzer
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
            Upload a <code className="text-[#D4A017] font-mono text-xs">.eml</code> or{' '}
            <code className="text-[#D4A017] font-mono text-xs">.msg</code> file.
            We parse the Received chain, verify DKIM / SPF / DMARC, and flag anything suspicious — all locally in your browser.
            Your email never leaves your machine.
          </p>
        </div>

        {/* Drop zone */}
        {!result && !error && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-sm p-16 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
              dragging ? 'border-[#D4A017] bg-[#D4A017]/5' : 'border-white/15 hover:border-[#D4A017]/50 hover:bg-white/5'
            }`}
          >
            <input ref={inputRef} type="file" accept=".eml,.msg" className="hidden" onChange={onFileChange} />
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Analyzing {fileName}</p>
              </div>
            ) : (
              <>
                <Upload size={28} className="text-gray-600" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                    Drop file here or click to browse
                  </p>
                  <p className="text-[11px] text-gray-600 uppercase tracking-widest">.eml · .msg</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="border border-red-500/30 bg-red-500/5 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <XCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-black uppercase tracking-wider text-red-400">Parse Error</p>
                <p className="text-sm text-gray-400 leading-relaxed">{error}</p>
              </div>
            </div>
            <button onClick={reset} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#D4A017] transition-colors">
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
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                  {result.hops.length} hop{result.hops.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {hasFlags
                  ? <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400">
                      <AlertTriangle size={11} /> {result.analysis.flags.length} flag{result.analysis.flags.length !== 1 ? 's' : ''}
                    </span>
                  : <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      <CheckCircle size={11} /> Clean
                    </span>
                }
                <button onClick={reset} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-[#D4A017] transition-colors">
                  Clear
                </button>
              </div>
            </div>

            {/* Received Chain */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017]">
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
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017]">
                Authentication Results
              </h2>
              <AuthSection authResults={result.analysis.authResults} />
            </section>

            {/* Flags */}
            <section className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017]">
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
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-[#F2F1EF]">
                Want a full deliverability audit?
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                This tool reads the headers. A real audit goes deeper — SPF record inspection,
                DKIM key rotation, DMARC policy review, blacklist checks, and a plain-English
                action plan your team can actually implement.
              </p>
              <button
                onClick={() => setView('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A017] text-[#1A1B1E] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] transition-transform"
              >
                Book a free audit <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
