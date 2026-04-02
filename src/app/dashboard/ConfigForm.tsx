'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomNumberInput from '@/components/CustomNumberInput';

interface ConfigFormProps {
  initialConfig: any;
  initialMaterials: any[];
  initialQualities: any[];
  initialInfills: any[];
  initialColors: any[];
}

export default function ConfigForm({ 
  initialConfig, 
  initialMaterials, 
  initialQualities, 
  initialInfills, 
  initialColors 
}: ConfigFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // States for new entries
  const [newMaterial, setNewMaterial] = useState({ name: '', costPerKg: '' });
  const [newQuality, setNewQuality] = useState('');
  const [newInfill, setNewInfill] = useState('');
  const [newColor, setNewColor] = useState('');

  async function handleConfigSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update config');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOption(type: string, data: any) {
    try {
      const res = await fetch('/api/admin/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
      if (!res.ok) throw new Error(`Failed to add ${type}`);
      
      // Reset relevant state
      if (type === 'material') setNewMaterial({ name: '', costPerKg: '' });
      if (type === 'quality') setNewQuality('');
      if (type === 'infill') setNewInfill('');
      if (type === 'color') setNewColor('');
      
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeleteOption(type: string, id: string) {
    if (!confirm('Are you sure you want to delete this option?')) return;
    try {
      const res = await fetch(`/api/admin/options?type=${type}&id=${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`Failed to delete ${type}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleUpdateOption(type: string, id: string, enabled?: boolean, extraData?: any) {
    try {
      const body: any = { type, id };
      if (enabled !== undefined) body.enabled = enabled;
      if (type === 'quality' && typeof extraData === 'number') {
        body.timeMultiplier = extraData;
      }
      if (type === 'material' && typeof extraData === 'number') {
        body.costPerKg = extraData;
      }

      const res = await fetch('/api/admin/options', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`Failed to update ${type}`);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  }

  const defaultConf = initialConfig || {
    printerKwhUsage: 0.15, electricityCostPerKwh: 0.2,
    machineLifeHours: 5000, machineCost: 699,
    fixedLaborFee: 2.0, failureBufferPercent: 0.1,
    profitMarginPercent: 0.5, minimumPrice: 5.0
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '3rem' }}>
      
      {/* Base Pricing Config */}
      <form className="glass" style={{ padding: '2rem', borderRadius: '12px' }} onSubmit={handleConfigSubmit}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'rgba(255,255,255,0.9)' }}>Base Pricing & Machine Specs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <CustomNumberInput 
            label="Electricity Cost/Kwh ($)"
            name="electricityCostPerKwh" 
            step="0.01" 
            defaultValue={defaultConf.electricityCostPerKwh} 
          />
          <CustomNumberInput 
            label="Printer Power (Kw)"
            name="printerKwhUsage" 
            step="0.01" 
            defaultValue={defaultConf.printerKwhUsage} 
          />
          <CustomNumberInput 
            label="Machine Cost ($)"
            name="machineCost" 
            step="1" 
            defaultValue={defaultConf.machineCost} 
          />
          <CustomNumberInput 
            label="Machine Life (Hours)"
            name="machineLifeHours" 
            step="1" 
            defaultValue={defaultConf.machineLifeHours} 
          />
          <CustomNumberInput 
            label="Fixed Labor Fee ($)"
            name="fixedLaborFee" 
            step="0.01" 
            defaultValue={defaultConf.fixedLaborFee} 
          />
          <CustomNumberInput 
            label="Failure Buffer (%)"
            name="failureBufferPercent" 
            step="0.01" 
            defaultValue={defaultConf.failureBufferPercent} 
          />
          <CustomNumberInput 
            label="Profit Margin (%)"
            name="profitMarginPercent" 
            step="0.01" 
            defaultValue={defaultConf.profitMarginPercent} 
          />
          <CustomNumberInput 
            label="Minimum Price ($)"
            name="minimumPrice" 
            step="0.01" 
            defaultValue={defaultConf.minimumPrice} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
            {loading ? 'Saving...' : 'Save Pricing Specs'}
          </button>
          {success && <span style={{ color: 'var(--success)' }}>Saved successfully!</span>}
        </div>
      </form>

      {/* Dynamic Options Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        
        {/* Materials */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Materials</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              placeholder="Name (e.g. PLA)" 
              value={newMaterial.name} 
              onChange={e => setNewMaterial({...newMaterial, name: e.target.value})}
              style={{ flex: 1, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }} 
            />
            <CustomNumberInput 
              placeholder="$/kg" 
              value={newMaterial.costPerKg} 
              onChange={val => setNewMaterial({...newMaterial, costPerKg: val.toString()})}
              style={{ width: '80px' }} 
            />
            <button 
              onClick={() => handleAddOption('material', newMaterial)} 
              disabled={!newMaterial.name || !newMaterial.costPerKg}
              style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
            >Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {initialMaterials.map(m => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', opacity: m.enabled ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={m.enabled} 
                    onChange={(e) => handleUpdateOption('material', m.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{m.name}</span>
                    <CustomNumberInput 
                      step="0.01"
                      defaultValue={m.costPerKg} 
                      onBlur={(e) => handleUpdateOption('material', m.id, m.enabled, parseFloat(e.target.value))}
                      style={{ width: '110px' }}
                    />
                  </div>
                </div>
                <button onClick={() => handleDeleteOption('material', m.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px 5px' }}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        {/* Qualities */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Qualities</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              placeholder="e.g. Standard (0.2mm)" 
              value={newQuality} 
              onChange={e => setNewQuality(e.target.value)}
              style={{ width: '100%', padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }} 
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <CustomNumberInput 
                placeholder="Time Multiplier (e.g. 1.0)" 
                step="0.1"
                defaultValue="1.0"
                id="newQualityMultiplier"
                style={{ flex: 1 }} 
              />
              <button 
                onClick={() => {
                  const mult = (document.getElementById('newQualityMultiplier') as HTMLInputElement).value;
                  handleAddOption('quality', { name: newQuality, timeMultiplier: mult });
                }} 
                disabled={!newQuality}
                style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
              >Add</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {initialQualities.map(q => (
              <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', opacity: q.enabled ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                  <input 
                    type="checkbox" 
                    checked={q.enabled} 
                    onChange={(e) => handleUpdateOption('quality', q.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{q.name}</span>
                    <CustomNumberInput 
                      step="0.1"
                      defaultValue={q.timeMultiplier} 
                      onBlur={(e) => handleUpdateOption('quality', q.id, q.enabled, parseFloat(e.target.value))}
                      style={{ width: '100px' }}
                    />
                  </div>
                </div>
                <button onClick={() => handleDeleteOption('quality', q.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px 5px' }}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        {/* Infills */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Infill %</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <CustomNumberInput 
              placeholder="e.g. 15" 
              value={newInfill} 
              onChange={val => setNewInfill(val.toString())}
              style={{ flex: 1 }} 
            />
            <button 
              onClick={() => handleAddOption('infill', { value: newInfill })} 
              disabled={!newInfill}
              style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
            >Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {initialInfills.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', opacity: i.enabled ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={i.enabled} 
                    onChange={(e) => handleUpdateOption('infill', i.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{i.value}%</span>
                </div>
                <button onClick={() => handleDeleteOption('infill', i.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px 5px' }}>&times;</button>
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Colors</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              placeholder="e.g. Matte Black" 
              value={newColor} 
              onChange={e => setNewColor(e.target.value)}
              style={{ flex: 1, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }} 
            />
            <button 
              onClick={() => handleAddOption('color', { name: newColor })} 
              disabled={!newColor}
              style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer' }}
            >Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {initialColors.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', opacity: c.enabled ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={c.enabled} 
                    onChange={(e) => handleUpdateOption('color', c.id, e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>{c.name}</span>
                </div>
                <button onClick={() => handleDeleteOption('color', c.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '2px 5px' }}>&times;</button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
