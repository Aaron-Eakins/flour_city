'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, Play, Package, Download } from 'lucide-react';

const COLUMNS = [
  { id: 'QUOTED', label: 'Pending / Quoted', icon: <Clock size={16} /> },
  { id: 'PAID', label: 'Ready to Print', icon: <Play size={16} /> },
  { id: 'PRINTING', label: 'On Machine', icon: <Package size={16} /> },
  { id: 'SHIPPED', label: 'Complete / Ready', icon: <CheckCircle size={16} /> },
];

export default function BoardView({ initialQuotes }: any) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const router = useRouter();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/quote/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setQuotes(quotes.map((q: any) => q.id === id ? { ...q, status: newStatus } : q));
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
      {COLUMNS.map(col => (
        <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: 'var(--primary)', opacity: 0.8 }}>{col.icon}</span>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{col.label}</h4>
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '100px', color: 'rgba(255,255,255,0.4)' }}>
              {quotes.filter((q: any) => q.status === col.id).length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '500px' }}>
            {quotes.filter((q: any) => q.status === col.id).map((quote: any) => (
              <div 
                key={quote.id} 
                className="glass card-hover" 
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: '12px', 
                  fontSize: '0.85rem',
                  border: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'default'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>#{quote.id.slice(-6)}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>${quote.totalCost.toFixed(2)}</span>
                </div>
                
                <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {quote.fileName}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Package size={12} /> {quote.customerEmail || 'No Email'}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={12} /> {new Date(quote.createdAt).toLocaleDateString()}
                   </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {col.id !== 'SHIPPED' && (
                    <button 
                      onClick={() => handleStatusChange(quote.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id)}
                      className="btn-primary" 
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem' }}
                    >
                      Advance
                    </button>
                  )}
                  {quote.blobUrl && (
                    <a 
                      href={quote.blobUrl} 
                      download 
                      title="Download STL"
                      style={{ padding: '0.4rem', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center' }}
                    >
                      <Download size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
