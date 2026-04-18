'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Power, DollarSign, Tag, Clock } from 'lucide-react';

export default function MaterialsTab({ initialMaterials }: any) {
  const [materials, setMaterials] = useState(initialMaterials);
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleMaterial = async (id: string, currentStatus: boolean) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/material/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      setMaterials(materials.map((m: any) => m.id === id ? { ...m, enabled: !currentStatus } : m));
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const updatePrice = async (id: string, newPrice: number) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/material/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerGram: newPrice }),
      });
      if (!res.ok) throw new Error('Failed');
      setMaterials(materials.map((m: any) => m.id === id ? { ...m, pricePerGram: newPrice } : m));
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
      {materials.map((mat: any) => (
        <div key={mat.id} className="glass card-hover" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', opacity: mat.enabled ? 1 : 0.6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: mat.colorHex || '#666', border: '2px solid rgba(255,255,255,0.1)' }}></div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>{mat.name}</h4>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>{mat.brand || mat.materialType}</p>
              </div>
            </div>
            <button 
              onClick={() => toggleMaterial(mat.id, mat.enabled)}
              style={{ background: mat.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: mat.enabled ? 'var(--success)' : 'var(--error)', border: 'none', padding: '6px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <Power size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                <DollarSign size={12} /> <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Price/g</span>
              </div>
              <input 
                type="number" 
                step="0.01"
                defaultValue={mat.pricePerGram || 0.15}
                onBlur={(e) => updatePrice(mat.id, parseFloat(e.target.value))}
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', outline: 'none' }}
              />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' }}>
                <Tag size={12} /> <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Type</span>
              </div>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{mat.materialType}</p>
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
             <Clock size={12} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}/>
             Last price update: {new Date(mat.updatedAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
