'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfigToggle({ initialValue }: { initialValue: boolean }) {
  const [notify, setNotify] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsUpdating(true);
    const newValue = !notify;
    setNotify(newValue);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifyOnQuote: newValue }),
      });
      if (!res.ok) throw new Error('Failed to update toggle');
      router.refresh();
    } catch (err) {
      console.error(err);
      // Revert optimism
      setNotify(!newValue);
      alert('Error saving configuration');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem 1.5rem', borderRadius: '12px' }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.2rem 0', color: 'rgba(255,255,255,0.9)' }}>Quote Generation Alerts</h4>
        <p style={{ margin: '0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          Send a notification to the admin email when a new quote is generated (useful for testing).
        </p>
      </div>
      <button 
        onClick={handleToggle}
        disabled={isUpdating}
        style={{
          width: '50px',
          height: '26px',
          borderRadius: '13px',
          background: notify ? 'var(--primary)' : 'rgba(255,255,255,0.2)',
          border: 'none',
          position: 'relative',
          cursor: isUpdating ? 'wait' : 'pointer',
          transition: 'background 0.3s ease'
        }}
      >
        <div style={{
          width: '22px',
          height: '22px',
          background: 'white',
          borderRadius: '11px',
          position: 'absolute',
          top: '2px',
          left: notify ? '26px' : '2px',
          transition: 'left 0.3s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  );
}
