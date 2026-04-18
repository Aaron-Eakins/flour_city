'use client';

import { useState } from 'react';
import QuoteTable from './QuoteTable';
import BoardView from '@/components/dashboard/BoardView';
import MaterialsTab from '@/components/dashboard/MaterialsTab';
import ContactMessagesTab from '@/components/dashboard/ContactMessagesTab';
import ConfigForm from './ConfigForm';
import { LayoutGrid, List, Package, MessageSquare, Settings, DollarSign, Activity } from 'lucide-react';

export default function DashboardClient({ 
  initialQuotes, 
  initialConfig,
  initialMaterials,
  initialQualities,
  initialInfills,
  initialNozzles,
  initialMessages
}: any) {
  const [viewMode, setViewMode] = useState<'TABLE' | 'BOARD'>('TABLE');
  const [activeTab, setActiveTab] = useState<'QUOTES' | 'MATERIALS' | 'MESSAGES' | 'CONFIG'>('QUOTES');

  const metrics = {
    totalRevenue: initialQuotes.filter((q: any) => ['PAID', 'PRINTING', 'SHIPPED'].includes(q.status)).reduce((acc: number, q: any) => acc + q.totalCost, 0),
    activeOrders: initialQuotes.filter((q: any) => q.status === 'PAID' || q.status === 'PRINTING').length,
    unreadMessages: initialMessages.filter((m: any) => m.status === 'UNREAD').length,
    totalGrams: initialQuotes.filter((q: any) => ['PAID', 'PRINTING', 'SHIPPED'].includes(q.status)).reduce((acc: number, q: any) => acc + q.weightGrams, 0),
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '3rem', lineHeight: 1.1, marginBottom: '0.5rem' }}>Operating Hub</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem' }}>Manage your Rochester 3D printing pipeline.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button 
            onClick={() => setActiveTab('QUOTES')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '8px', 
              background: activeTab === 'QUOTES' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: activeTab === 'QUOTES' ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            <Activity size={18} /> Quotes
          </button>
          <button 
            onClick={() => setActiveTab('MATERIALS')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '8px', 
              background: activeTab === 'MATERIALS' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: activeTab === 'MATERIALS' ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            <Package size={18} /> Materials
          </button>
          <button 
            onClick={() => setActiveTab('MESSAGES')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '8px', 
              background: activeTab === 'MESSAGES' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: activeTab === 'MESSAGES' ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              position: 'relative'
            }}
          >
            <MessageSquare size={18} /> 
            Messages
            {metrics.unreadMessages > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '18px', height: '18px', background: 'var(--error)', borderRadius: '50%', color: 'white', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {metrics.unreadMessages}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('CONFIG')}
            style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '8px', 
              background: activeTab === 'CONFIG' ? 'rgba(99,102,241,0.1)' : 'transparent',
              color: activeTab === 'CONFIG' ? 'var(--primary)' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
          >
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      {/* Real-time Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>REVENUE</h3>
            <DollarSign size={20} color="var(--success)" />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>${metrics.totalRevenue.toFixed(2)}</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>From paid & completed orders</p>
        </div>

        <div className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>ACTIVE LOAD</h3>
            <Activity size={20} color="var(--primary)" />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>{metrics.activeOrders}</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Orders on printer or queued</p>
        </div>

        <div className="glass card-hover" style={{ padding: '2rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '1px' }}>FILAMENT USED</h3>
            <Package size={20} color="#fbbf24" />
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '0' }}>{(metrics.totalGrams / 1000).toFixed(2)}kg</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>Throughput across all materials</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {activeTab === 'QUOTES' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '2px' }}>
                <button 
                  onClick={() => setViewMode('TABLE')}
                  style={{ padding: '0.5rem', borderRadius: '6px', background: viewMode === 'TABLE' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'TABLE' ? 'white' : 'rgba(255,255,255,0.3)' }}
                >
                  <List size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('BOARD')}
                  style={{ padding: '0.5rem', borderRadius: '6px', background: viewMode === 'BOARD' ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'BOARD' ? 'white' : 'rgba(255,255,255,0.3)' }}
                >
                  <LayoutGrid size={20} />
                </button>
              </div>
            </div>
            {viewMode === 'TABLE' ? (
              <QuoteTable initialQuotes={initialQuotes} />
            ) : (
              <BoardView initialQuotes={initialQuotes} />
            )}
          </>
        )}

        {activeTab === 'MATERIALS' && (
          <MaterialsTab initialMaterials={initialMaterials} />
        )}

        {activeTab === 'MESSAGES' && (
          <ContactMessagesTab initialMessages={initialMessages} />
        )}

        {activeTab === 'CONFIG' && (
          <ConfigForm 
            initialConfig={initialConfig} 
            initialMaterials={initialMaterials}
            initialQualities={initialQualities}
            initialInfills={initialInfills}
            initialNozzles={initialNozzles}
          />
        )}
      </div>
    </div>
  );
}
