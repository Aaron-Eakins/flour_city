'use client';

import { useState } from 'react';
import styles from './page.module.css';
import UploadDropzone from '../components/UploadDropzone';
import ModelViewer from '../components/ModelViewer';
import { calculateQuote, QuoteResult } from '../lib/quoteEngine';

export default function Home() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [dbQuoteId, setDbQuoteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleFileAccepted = (file: File) => {
    setFileToUpload(file);
    setQuote(null);
    setDbQuoteId(null);
    setErrorMsg(null);
  };

  const handleCheckout = async () => {
    if (!dbQuoteId) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: dbQuoteId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to initialize checkout');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
      setIsCheckingOut(false);
    }
  };

  const handleAnalyze = async () => {
    if (!fileToUpload) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await fetch('/api/quote', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${response.status}: Failed to slice the model.`);
      }

      const data = await response.json();
      setQuote(data.quoteData);
      setDbQuoteId(data.dbQuoteId);
      console.log('Quote saved to database with ID:', data.dbQuoteId);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An unknown error occurred during slicing.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetFlow = () => {
    setFileToUpload(null);
    setQuote(null);
    setDbQuoteId(null);
    setErrorMsg(null);
  };

  return (
    <main className={styles.main}>
      <div className={`${styles.hero} animate-fade-in`} style={{ marginBottom: fileToUpload ? '2rem' : '4rem' }}>
        <h1 className={styles.title}>
          Instant Quotes for <br />
          <span className="text-gradient-primary">Bambu P1S</span> 3D Printing
        </h1>
        <p className={styles.subtitle}>
          Upload your STL or 3MF file to get an automated price calculated based on exact print time, filament usage, and machine overhead.
        </p>
      </div>

      <div className={styles.uploadContainer} style={fileToUpload ? { maxWidth: '1000px', width: '100%' } : {}}>
        {!fileToUpload && (
            <UploadDropzone onFileAccepted={handleFileAccepted} />
        )}

        {fileToUpload && (
          <div className="glass animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 1fr)', gap: '2rem', padding: '2rem' }}>
            
            {/* Left Column: 3D Preview */}
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden', minHeight: '400px', position: 'relative' }}>
              <ModelViewer file={fileToUpload} />
            </div>

            {/* Right Column: Quoting Logic */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {!quote && (
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ marginBottom: '1rem' }}>Ready to Analyze</h2>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--success)', fontWeight: 'bold', wordBreak: 'break-all' }}>✓ {fileToUpload.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                      {(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB • {fileToUpload.name.split('.').pop()?.toUpperCase()}
                    </p>
                  </div>
                  
                  {errorMsg && (
                    <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  <button 
                    className="btn-primary" 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    style={{ width: '100%' }}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Slicing via Backend CLI...
                      </>
                    ) : (
                      'Generate Quote'
                    )}
                  </button>
                  <div style={{ marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={resetFlow} style={{ border: 'none', width: '100%' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {quote && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--success)', fontSize: '0.9rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Analysis Complete</p>
                    <h2 style={{ fontSize: '3rem', margin: '0' }} className="text-gradient">${quote.totalCost.toFixed(2)}</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>Estimated Time</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{Math.floor(quote.metrics.printTimeHours)}h {Math.round((quote.metrics.printTimeHours % 1) * 60)}m</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>Filament Usage</p>
                      <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{Math.round(quote.metrics.weightGrams)}g</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Cost Breakdown</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Material (PLA):</span>
                      <span>${quote.breakdown.materialCost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Electricity:</span>
                      <span>${quote.breakdown.electricityCost.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Labor & Setup:</span>
                      <span>${quote.breakdown.labor.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Depreciation & Maint:</span>
                      <span>${quote.breakdown.machineDepreciation.toFixed(2)}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      className="btn-primary" 
                      style={{ flex: 1 }} 
                      onClick={handleCheckout} 
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? 'Redirecting to Stripe...' : 'Proceed to Checkout'}
                    </button>
                    <button className="btn-secondary" onClick={resetFlow}>Start Over</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 800px) {
          .glass {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </main>
  );
}
