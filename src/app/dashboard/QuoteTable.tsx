'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Quote = {
  id: string;
  fileName: string;
  totalCost: number;
  status: string;
  customerEmail: string | null;
  createdAt: string;
};

export default function QuoteTable({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/quote/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      const updatedQuote = await res.json();
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: updatedQuote.status } : q));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    } finally {
      setUpdating(null);
    }
  };

  const statusColors: Record<string, string> = {
    QUOTED: 'rgba(255, 255, 255, 0.4)',
    PAID: 'rgba(56, 189, 248, 0.8)',
    PRINTING: 'rgba(250, 204, 21, 0.8)',
    SHIPPED: 'rgba(34, 197, 94, 0.8)',
  };

  return (
    <div className="glass" style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
          <tr>
            <th style={{ padding: '1rem' }}>ID</th>
            <th style={{ padding: '1rem' }}>File</th>
            <th style={{ padding: '1rem' }}>Cost</th>
            <th style={{ padding: '1rem' }}>Email</th>
            <th style={{ padding: '1rem' }}>Date</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(quote => (
            <tr key={quote.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span title={quote.id}>{quote.id.slice(-6)}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(quote.id);
                      alert('ID Copied!');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'rgba(255,255,255,0.4)' }}
                    title="Copy Full ID"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                  <button 
                    onClick={() => {
                      const url = `${window.location.origin}/status?quoteId=${quote.id}`;
                      navigator.clipboard.writeText(url);
                      alert('Tracking Link Copied!');
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'rgba(255,255,255,0.4)' }}
                    title="Copy Tracking Link"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                    </svg>
                  </button>
                </div>
              </td>
              <td style={{ padding: '1rem' }}>{quote.fileName}</td>
              <td style={{ padding: '1rem', fontWeight: 'bold' }}>${quote.totalCost.toFixed(2)}</td>
              <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.8)' }}>{quote.customerEmail || '—'}</td>
              <td style={{ padding: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                {new Date(quote.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  background: statusColors[quote.status] || 'rgba(255,255,255,0.2)',
                  color: '#000'
                }}>
                  {quote.status}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                <select 
                  value={quote.status} 
                  onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                  disabled={updating === quote.id}
                  style={{ 
                    background: 'rgba(0,0,0,0.5)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.2)', 
                    padding: '8px', 
                    borderRadius: '6px',
                    outline: 'none',
                    cursor: updating === quote.id ? 'wait' : 'pointer'
                  }}
                >
                  <option value="QUOTED">QUOTED</option>
                  <option value="PAID">PAID</option>
                  <option value="PRINTING">PRINTING</option>
                  <option value="SHIPPED">SHIPPED</option>
                </select>
              </td>
            </tr>
          ))}
          {quotes.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                No quotes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
