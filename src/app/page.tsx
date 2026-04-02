'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import UploadDropzone from '../components/UploadDropzone';
import ModelViewer from '../components/ModelViewer';
import { QuoteResult } from '../lib/quoteEngine';

export default function Home() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [dbQuoteId, setDbQuoteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Dynamic Options State
  const [options, setOptions] = useState<{
    materials: any[],
    qualities: any[],
    infillOptions: any[],
    colors: any[]
  }>({
    materials: [],
    qualities: [],
    infillOptions: [],
    colors: []
  });

  // Print Options Selection State
  const [material, setMaterial] = useState('PLA');
  const [quality, setQuality] = useState('Standard');
  const [infill, setInfill] = useState('15');
  const [color, setColor] = useState('Black');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        setOptions(data);
        
        // Set defaults from fetched data if not empty
        if (data.materials?.length) setMaterial(data.materials[0].name);
        if (data.qualities?.length) setQuality(data.qualities[0].name);
        if (data.infillOptions?.length) setInfill(data.infillOptions[0].value.toString());
        if (data.colors?.length) setColor(data.colors[0].name);
      } catch (err) {
        console.error('Failed to fetch options:', err);
      }
    }
    fetchOptions();
  }, []);


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
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error).message);
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
      formData.append('material', material);
      formData.append('quality', quality);
      formData.append('infill', infill);
      formData.append('color', color);
      formData.append('quantity', quantity);

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
    } catch (err) {
      console.error(err);
      setErrorMsg((err as Error).message || 'An unknown error occurred during slicing.');
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
      {/* Navigation Header */}
      <nav style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        padding: '1.5rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        zIndex: 100
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
          Flour City Prints
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          <a href="/" style={{ color: 'white', fontWeight: 600 }}>Home</a>
          <a href="/status" style={{ textDecoration: 'none', color: 'inherit' }}>Order Status</a>
          <a href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>Admin</a>
        </div>
      </nav>

      <div className={`${styles.hero} animate-fade-in`} style={{ marginBottom: fileToUpload ? '2rem' : '4rem', marginTop: '6rem' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Powered by Precision
        </div>
        <h1 className={styles.title} style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
          Flour City <br />
          <span className="text-gradient-primary">Prints</span>
        </h1>
        <p className={styles.subtitle} style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)' }}>
          High-performance 3D printing. Upload your models for <br />
          instant, slice-accurate quoting on our Bambu P1S fleet.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ color: 'var(--success)' }}>●</span> Instant Analysis
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ color: 'var(--success)' }}>●</span> Local Production
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)' }}>
            <span style={{ color: 'var(--success)' }}>●</span> Fast Shipping
          </div>
        </div>
      </div>

      <div className={styles.uploadContainer} style={fileToUpload ? { maxWidth: '1000px', width: '100%' } : {}}>
        {!fileToUpload && (
            <UploadDropzone onFileAccepted={handleFileAccepted} />
        )}

        {fileToUpload && (
          <div className="glass animate-fade-in card-hover" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 1fr)', gap: '2rem', padding: '2rem' }}>
            
            {/* Left Column: 3D Preview */}
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden', minHeight: '400px', position: 'relative' }}>
              <ModelViewer file={fileToUpload} />
            </div>

            {/* Right Column: Quoting Logic */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              
              {!quote && (
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Configure Print</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>Material</label>
                      <select 
                        value={material} 
                        onChange={e => setMaterial(e.target.value)} 
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px' }}
                      >
                        {options.materials.map(m => (
                          <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                        {options.materials.length === 0 && <option value="PLA">PLA (Standard)</option>}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>Quality</label>
                      <select 
                        value={quality} 
                        onChange={e => setQuality(e.target.value)} 
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px' }}
                      >
                        {options.qualities.map(q => (
                          <option key={q.id} value={q.name}>{q.name}</option>
                        ))}
                        {options.qualities.length === 0 && <option value="Standard">Standard (0.20mm)</option>}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>Infill Density</label>
                      <select 
                        value={infill} 
                        onChange={e => setInfill(e.target.value)} 
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px' }}
                      >
                        {options.infillOptions.map(i => (
                          <option key={i.id} value={i.value.toString()}>{i.value}%</option>
                        ))}
                        {options.infillOptions.length === 0 && <option value="15">15% (Standard)</option>}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>Color</label>
                      <select 
                        value={color} 
                        onChange={e => setColor(e.target.value)} 
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px' }}
                      >
                        {options.colors.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        {options.colors.length === 0 && <option value="Black">Black</option>}
                      </select>
                    </div>

                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.3rem' }}>Quantity</label>
                    <input type="number" min="1" max="100" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} />
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
                        Calculating Price...
                      </>
                    ) : (
                      'Generate Quote'
                    )}
                  </button>
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
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
