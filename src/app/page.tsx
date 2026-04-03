'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { upload } from '@vercel/blob/client';
import styles from './page.module.css';
import Navbar from '../components/Navbar';
import UploadDropzone from '../components/UploadDropzone';
import ModelViewer from '../components/ModelViewer';
import { QuoteResult } from '../lib/quoteEngine';
import CustomDropdown from '../components/CustomDropdown';
import CustomNumberInput from '../components/CustomNumberInput';
import ContactForm from '../components/ContactForm';
import { Mail, MapPin } from 'lucide-react';

export default function Home() {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [dbQuoteId, setDbQuoteId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [dimensions, setDimensions] = useState<{ x: number, y: number, z: number } | null>(null);

  // Dynamic Options State
  const [options, setOptions] = useState<{
    materials: any[],
    qualities: any[],
    infillOptions: any[],
    colors: any[],
    nozzleDiameters: any[]
  }>({
    materials: [],
    qualities: [],
    infillOptions: [],
    colors: [],
    nozzleDiameters: []
  });


  // Print Options Selection State
  const [material, setMaterial] = useState('');
  const [quality, setQuality] = useState('');
  const [infill, setInfill] = useState('');
  const [color, setColor] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [nozzleId, setNozzleId] = useState('');
  const [isMultiColor, setIsMultiColor] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [colorTransitions, setColorTransitions] = useState('0');
  
  // New logistics state
  const [deliveryMethod, setDeliveryMethod] = useState<'PICKUP' | 'SHIPPING'>('SHIPPING');
  const [turnaroundTier, setTurnaroundTier] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await fetch('/api/config');
        const data = await res.json();
        
        // Add % display field to infills for the custom dropdown
        const formattedInfills = (data.infillOptions || []).map((i: any) => ({
          ...i,
          display: `${i.value}%`,
          stringValue: i.value.toString()
        }));

        setOptions({
          ...data,
          infillOptions: formattedInfills
        });
        
        // Set defaults from fetched data if not empty
        if (data.materials?.length) setMaterial(data.materials[0].name);
        if (data.qualities?.length) setQuality(data.qualities[0].name);
        if (formattedInfills.length) setInfill(formattedInfills[0].stringValue);
        if (data.colors?.length) setColor(data.colors[0].name);
        if (data.nozzleDiameters?.length) setNozzleId(data.nozzleDiameters[0].id);

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

  const amsFilaments = options.materials.filter(m => m.amsSlot !== null);
  const hasAms = amsFilaments.length >= 2;

  const handleSlotToggle = (slot: number) => {
    if (selectedSlots.includes(slot)) {
      const next = selectedSlots.filter(s => s !== slot);
      setSelectedSlots(next);
      setColorTransitions(Math.max(0, next.length - 1).toString());
    } else if (selectedSlots.length < 4) {
      const next = [...selectedSlots, slot];
      setSelectedSlots(next);
      setColorTransitions(Math.max(0, next.length - 1).toString());
    }
  };

  const handleAnalyze = async () => {
    if (!fileToUpload) return;
    setErrorMsg(null);
    setQuote(null);

    try {
      setIsUploading(true);
      const blob = await upload(fileToUpload.name, fileToUpload, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });
      setIsUploading(false);

      setIsAnalyzing(true);
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blobUrl: blob.url,
          fileName: fileToUpload.name,
          material,
          quality,
          infill,
          color: material,
          quantity,
          nozzleId,
          isMultiColor,
          selectedSlots,
          colorTransitions: parseInt(colorTransitions) || 0,
          deliveryMethod,
          turnaroundTier
        }),
      });

      if (!response.ok) {
        let errorMessage = `Server error ${response.status}`;
        try {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } catch {
          if (response.status === 504) errorMessage = 'Server timed out. Try a smaller file.';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.quoteData || !data.dbQuoteId) {
        throw new Error('Invalid response format from server.');
      }

      setQuote(data.quoteData);
      setDbQuoteId(data.dbQuoteId);
      setDimensions(data.dimensions || null);
    } catch (err) {
      console.error('Analysis Error:', err);
      setErrorMsg((err as Error).message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const resetFlow = () => {
    setFileToUpload(null);
    setQuote(null);
    setDbQuoteId(null);
    setErrorMsg(null);
    setDimensions(null);
  };

  return (
    <main className={styles.main}>
      <Navbar />

      <div className={`${styles.hero} animate-fade-in`} style={{ marginBottom: fileToUpload ? '2rem' : '4rem', marginTop: '6rem' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
          Precision Printing
        </div>
        <h1 className={styles.title + ' fcp-hero-title'} style={{ fontSize: '4rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
          Flour City <br />
          <span className="text-gradient-primary">Prints</span>
        </h1>
        <p className={styles.subtitle} style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)' }}>
          High-performance 3D printing. Upload your models for
          instant, slice-accurate quoting on our Bambu P1S fleet.
        </p>
      </div>

      <div className={styles.uploadContainer} style={fileToUpload ? { maxWidth: '1000px', width: '100%' } : {}}>
        {!fileToUpload && (
          <>
            <UploadDropzone onFileAccepted={handleFileAccepted} />
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '0.75rem' }}>
              Most prints run $3 – $40 depending on size and material.
            </p>
          </>
        )}

        {fileToUpload && (
          <div className={styles.quoteGrid + ' glass animate-fade-in card-hover'} style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 1fr)', gap: '2rem', padding: '2rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', overflow: 'hidden', minHeight: '400px', position: 'relative' }}>
              <ModelViewer file={fileToUpload} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {!quote ? (
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Configure Print</h2>
                  
                    <div style={{ marginBottom: '1rem' }}>
                      {!isMultiColor ? (
                        <>
                          <CustomDropdown 
                            label="Filament / Color"
                            options={options.materials}
                            value={material}
                            onChange={setMaterial}
                            displayField="name"
                            valueField="name"
                            placeholder="Select Filament"
                          />
                          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.4rem' }}>
                            {material.includes('PLA') ? '🌱 Best for models, toys, and display pieces.' : 
                             material.includes('PETG') ? '🔩 Best for functional parts and outdoor use.' :
                             material.includes('ABS') ? '🔥 Best for high-heat automotive applications.' :
                             'Reliable, high-quality industrial filaments.'}
                          </p>
                        </>
                      ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Select AMS Filaments (2-4)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                          {amsFilaments.map(m => (
                            <div 
                              key={m.id}
                              onClick={() => handleSlotToggle(m.amsSlot)}
                              style={{ 
                                padding: '0.6rem', 
                                background: selectedSlots.includes(m.amsSlot) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', 
                                border: `1px solid ${selectedSlots.includes(m.amsSlot) ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem'
                              }}
                            >
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: m.colorHex || '#666', border: '1px solid rgba(255,255,255,0.2)' }} />
                              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{m.colorName || m.name}</span>
                                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>Slot {m.amsSlot} • {m.brand}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <CustomDropdown 
                      label="Print Quality"
                      options={options.qualities}
                      value={quality}
                      onChange={setQuality}
                      placeholder="Select Quality"
                    />
                    <CustomDropdown 
                      label="Infill Density"
                      options={options.infillOptions}
                      value={infill}
                      onChange={setInfill}
                      displayField="display"
                      valueField="stringValue"
                      placeholder="Select Infill"
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <CustomDropdown 
                      label="Nozzle Size"
                      options={options.nozzleDiameters}
                      value={nozzleId}
                      onChange={setNozzleId}
                      displayField="label"
                      valueField="id"
                      placeholder="Select Nozzle"
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Multi-color Print?</label>
                      <div 
                        onClick={() => hasAms && setIsMultiColor(!isMultiColor)}
                        style={{ 
                          height: '42px', 
                          background: isMultiColor ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', 
                          border: `1px solid ${isMultiColor ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: !hasAms ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '0.85rem',
                          color: !hasAms ? 'rgba(255,255,255,0.2)' : (isMultiColor ? 'var(--primary)' : 'rgba(255,255,255,0.5)'),
                          fontWeight: isMultiColor ? 'bold' : 'normal'
                        }}
                      >
                        {!hasAms ? 'AMS Not Ready' : (isMultiColor ? '✓ Multi-color Active' : 'Single Color')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <CustomNumberInput 
                      label="Quantity" 
                      min="1" 
                      max="100" 
                      value={quantity} 
                      onChange={val => setQuantity(val.toString())} 
                    />
                    {isMultiColor && (
                      <CustomNumberInput 
                        label="Est. Transitions" 
                        min="1" 
                        max="20000" 
                        value={colorTransitions} 
                        onChange={val => setColorTransitions(val.toString())} 
                      />
                    )}
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.5rem' }}>Delivery & Turnaround</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div 
                        onClick={() => setDeliveryMethod(deliveryMethod === 'SHIPPING' ? 'PICKUP' : 'SHIPPING')}
                        style={{ 
                          padding: '0.6rem', 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Logistics</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: deliveryMethod === 'PICKUP' ? 'var(--primary)' : 'white' }}>
                          {deliveryMethod === 'PICKUP' ? '📍 Local Pickup' : '🚚 Shipping'}
                        </span>
                      </div>
                      <div 
                        onClick={() => setTurnaroundTier(turnaroundTier === 'STANDARD' ? 'EXPRESS' : 'STANDARD')}
                        style={{ 
                          padding: '0.6rem', 
                          background: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem'
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Priority</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: turnaroundTier === 'EXPRESS' ? '#fbbf24' : 'white' }}>
                          {turnaroundTier === 'EXPRESS' ? '⚡ Express' : '📅 Standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      {errorMsg}
                    </div>
                  )}

                  <button className="btn-primary" onClick={handleAnalyze} disabled={isUploading || isAnalyzing} style={{ width: '100%' }}>
                    {(isUploading || isAnalyzing) ? 'Processing...' : 'Generate Quote'}
                  </button>
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button className="btn-secondary" onClick={resetFlow} style={{ border: 'none', width: '100%' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
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

                  {dimensions && (
                    <div style={{ 
                      background: 'rgba(255,255,255,0.03)', 
                      padding: '1rem', 
                      borderRadius: '8px',
                      border: (dimensions.x > 256 || dimensions.y > 256 || dimensions.z > 256) ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.2rem' }}>Dimensions (X, Y, Z)</p>
                         <span style={{ fontSize: '0.7rem', color: (dimensions.x > 256 || dimensions.y > 256 || dimensions.z > 256) ? 'var(--error)' : 'var(--success)', fontWeight: 'bold' }}>
                            {(dimensions.x > 256 || dimensions.y > 256 || dimensions.z > 256) ? '⚠️ EXCEEDS PLATE' : '✓ FITS 256mm PLATE'}
                         </span>
                      </div>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {dimensions.x.toFixed(1)} x {dimensions.y.toFixed(1)} x {dimensions.z.toFixed(1)} mm
                      </p>
                    </div>
                  )}

                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>Cost Breakdown</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>Material:</span>
                      <span>${quote.breakdown.materialCost.toFixed(2)}</span>
                    </div>
                    {quote.breakdown.amsPurgeCost > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Multi-color Prep:</span>
                        <span>${quote.breakdown.amsPurgeCost.toFixed(2)}</span>
                      </div>
                    )}
                    {turnaroundTier === 'EXPRESS' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#fbbf24' }}>Express Premium:</span>
                        <span style={{ color: '#fbbf24' }}>+50%</span>
                      </div>
                    )}
                    {deliveryMethod === 'SHIPPING' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.6)' }}>Shipping:</span>
                        <span>$5.00</span>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleCheckout} disabled={isCheckingOut}>
                      {isCheckingOut ? 'Redirecting...' : 'Checkout'}
                    </button>
                    <button className="btn-secondary" onClick={resetFlow}>Start Over</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <section id="contact" style={{ marginTop: '8rem', width: '100%', maxWidth: '900px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Get in <span className="text-gradient">Touch</span></h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '3rem' }}>
          Have a bulk order or a custom project? We're here to help Rochester grow.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
          <ContactForm />
          
          <div style={{ textAlign: 'left', padding: '1rem' }}>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Business Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>Location</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Rochester, New York<br />Pickup instructions sent after payment.</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', background: 'rgba(99,102,241,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                  <Mail size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 'bold', marginBottom: '0.2rem' }}>Email</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>roc@flourcityprints.com</p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(255,193,7,0.05)', border: '1px solid rgba(255,193,7,0.1)', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.85rem', color: '#fbbf24', lineHeight: '1.6' }}>
                <strong>Note:</strong> We currently operate one high-speed Bambu P1S. Lead times are typically 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ width: '100%', padding: '4rem 2rem 2rem 2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8rem' }}>
        <div>© {new Date().getFullYear()} Flour City Prints · Rochester, NY</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
          <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</Link>
          <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Admin</Link>
        </div>
      </footer>

      {/* Pricing Summary Section (Differentiator: Visible Pricing Before Upload)
      {!fileToUpload && (
        <section id="ballpark-pricing" style={{ 
          marginTop: '6rem', 
          width: '100%', 
          maxWidth: '1000px', 
          textAlign: 'center',
          animation: 'fade-in 1.5s'
        }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Transparent <span className="text-gradient-primary">Rates</span></h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {[
              { type: 'PLA', icon: '🌱', start: '$10', use: 'Standard prototyping' },
              { type: 'PETG', icon: '🔩', start: '$12', use: 'Functional & Outdoor' },
              { type: 'ABS', icon: '🔥', start: '$15', use: 'Heat resistant' },
              { type: 'TPU', icon: '👟', start: '$18', use: 'Flexible & Gaskets' }
            ].map(m => (
              <div key={m.type} className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{m.icon}</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{m.type}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  Starting at {m.start}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>{m.use}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
             Average part ships in <span style={{ color: 'white' }}>24-48 hours</span>. Express same-day turnaround available.
          </p>
        </section>
      )}
      */}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </main>
  );
}
