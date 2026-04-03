'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [formData, setFormData] = useState({
    name: 'Aaron Eakins',
    companyName: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('SENDING');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to send');
      setStatus('SUCCESS');
      setFormData({ name: 'Aaron Eakins', companyName: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('ERROR');
    }
  };

  if (status === 'SUCCESS') {
    return (
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '16px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Message Sent!</h3>
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>
          Thanks for reaching out. We'll get back to you in Rochester shortly.
        </p>
        <button 
          onClick={() => setStatus('IDLE')}
          style={{ marginTop: '1.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Name</label>
          <input 
            required
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Aaron Eakins"
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Company (Optional)</label>
          <input 
            type="text" 
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            placeholder="Flour City Prints"
            style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Email</label>
        <input 
          required
          type="email" 
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="roc@example.com"
          style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Subject</label>
        <input 
          type="text" 
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          placeholder="Bulk order inquiry / Custom design"
          style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Message</label>
        <textarea 
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          placeholder="How can we help with your 3D printing needs?"
          style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'vertical' }}
        />
      </div>

      {status === 'ERROR' && (
        <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>⚠️ Something went wrong. Please try again.</p>
      )}

      <button 
        type="submit" 
        disabled={status === 'SENDING'}
        className="btn-primary" 
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {status === 'SENDING' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
