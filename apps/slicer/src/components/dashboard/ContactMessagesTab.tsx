'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, MessageCircle, Clock, Trash2, CheckSquare } from 'lucide-react';

export default function ContactMessagesTab({ initialMessages }: any) {
  const [messages, setMessages] = useState(initialMessages);
  const router = useRouter();

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      if (newStatus === 'ARCHIVED') {
        setMessages(messages.filter((m: any) => m.id !== id));
      } else {
        setMessages(messages.map((m: any) => m.id === id ? { ...m, status: newStatus } : m));
      }
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {messages.length === 0 && (
        <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '16px', color: 'rgba(255,255,255,0.4)' }}>
          <MessageCircle size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
          <p>No messages yet. They will appear here when customers contact you.</p>
        </div>
      )}

      {messages.map((msg: any) => (
        <div 
          key={msg.id} 
          className="glass card-hover" 
          style={{ 
            padding: '2rem', 
            borderRadius: '20px', 
            border: '1px solid rgba(255,255,255,0.05)',
            borderLeft: msg.status === 'UNREAD' ? '4px solid var(--primary)' : '4px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Customer</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                  <User size={16} color="var(--primary)" /> {msg.name}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Email</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
                  <Mail size={16} /> {msg.email}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)' }}>
                  <Clock size={16} /> {new Date(msg.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {msg.status === 'UNREAD' && (
                <button 
                  onClick={() => handleStatusChange(msg.id, 'READ')}
                  style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                  title="Mark as Read"
                >
                  <CheckSquare size={18} />
                </button>
              )}
              <button 
                onClick={() => handleStatusChange(msg.id, 'ARCHIVED')}
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}
                title="Archive Message"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h5 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{msg.subject || 'General Inquiry'}</h5>
            <p style={{ margin: 0, lineHeight: '1.7', color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-wrap' }}>
              {msg.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
