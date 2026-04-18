'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomNumberInput from '@/components/CustomNumberInput';

interface ConfigFormProps {
  initialConfig: any;
  initialMaterials: any[];
  initialQualities: any[];
  initialInfills: any[];
  initialNozzles: any[];
}



export default function ConfigForm({ 
  initialConfig, 
  initialMaterials, 
  initialQualities, 
  initialInfills, 
  initialNozzles
}: ConfigFormProps) {



  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // States for new entries
  const [newMaterial, setNewMaterial] = useState({ 
    name: '', costPerKg: '', brand: '', modelNumber: '', colorName: '', colorHex: '#000000', sku: '', materialType: 'PLA', amsSlot: '' 
  });
  const [newQuality, setNewQuality] = useState('');
  const [newInfill, setNewInfill] = useState('');
  const [newNozzle, setNewNozzle] = useState({ diameter: '', swapFee: '0' });


  // Password change state
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passStatus, setPassStatus] = useState({ type: '', msg: '' });


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

  async function handlePasswordSubmit(e: React.FormEvent) {

    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPassStatus({ type: 'error', msg: 'Passwords do not match' });
      return;
    }
    setPassLoading(true);
    setPassStatus({ type: '', msg: '' });
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to change password');
      }
      setPassStatus({ type: 'success', msg: 'Password changed successfully' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setPassStatus({ type: 'error', msg: err.message });
    } finally {
      setPassLoading(false);
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
      if (type === 'material') setNewMaterial({ 
        name: '', costPerKg: '', brand: '', modelNumber: '', colorName: '', colorHex: '#000000', sku: '', materialType: 'PLA', amsSlot: '' 
      });
      if (type === 'quality') setNewQuality('');
      if (type === 'infill') setNewInfill('');
      if (type === 'nozzle') setNewNozzle({ diameter: '', swapFee: '0' });

      
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
      
      // Add all updateData fields if provided
      if (extraData && typeof extraData === 'object') {
        Object.assign(body, extraData);
      } else if (typeof extraData === 'number') {
        // Legacy support/simple update
        if (type === 'quality') body.timeMultiplier = extraData;
        if (type === 'material') body.costPerKg = extraData;
        if (type === 'nozzle') body.swapFee = extraData;

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
      
      {/* Password Change */}
      <form className="glass" style={{ padding: '2rem', borderRadius: '12px' }} onSubmit={handlePasswordSubmit}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'rgba(255,255,255,0.9)' }}>Security</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Current Password</label>
            <input 
              type="password" 
              value={passwords.current} 
              onChange={e => setPasswords({...passwords, current: e.target.value})} 
              style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>New Password</label>
            <input 
              type="password" 
              value={passwords.next} 
              onChange={e => setPasswords({...passwords, next: e.target.value})} 
              style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Confirm New Password</label>
            <input 
              type="password" 
              value={passwords.confirm} 
              onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
              style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} 
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="submit" disabled={passLoading} className="btn-primary" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
          {passStatus.msg && (
            <span style={{ color: passStatus.type === 'success' ? 'var(--success)' : 'var(--error)' }}>
              {passStatus.msg}
            </span>
          )}
        </div>
      </form>

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

        <h3 style={{ margin: '1.5rem 0 1rem 0', color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>AMS & Purge Specs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <CustomNumberInput 
            label="AMS Swap Fee ($)"
            name="amsSwapFee" 
            step="0.01" 
            defaultValue={defaultConf.amsSwapFee} 
          />
          <CustomNumberInput 
            label="AMS Swap Time (Sec)"
            name="amsSwapTimeSeconds" 
            step="1" 
            defaultValue={defaultConf.amsSwapTimeSeconds} 
          />
          <CustomNumberInput 
            label="Purge Vol (cm³)"
            name="purgeVolumePerTransitionCm3" 
            step="0.1" 
            defaultValue={defaultConf.purgeVolumePerTransitionCm3} 
          />
          <CustomNumberInput 
            label="Purge Waste Multiplier"
            name="purgeWasteCostMultiplier" 
            step="0.1" 
            defaultValue={defaultConf.purgeWasteCostMultiplier} 
          />
          <CustomNumberInput 
            label="Prime Tower Vol (%)"
            name="primeTowerVolumePercent" 
            step="0.01" 
            defaultValue={defaultConf.primeTowerVolumePercent} 
          />
          <CustomNumberInput 
            label="Multi-Color Buffer (%)"
            name="multiColorFailureBufferExtra" 
            step="0.01" 
            defaultValue={defaultConf.multiColorFailureBufferExtra} 
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
          <h4 style={{ margin: '0 0 1rem 0' }}>Filament Inventory</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input placeholder="Brand" value={newMaterial.brand} onChange={e => setNewMaterial({...newMaterial, brand: e.target.value})} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }} />
              <input placeholder="Material (PLA, PETG)" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '0.5rem' }}>
              <input placeholder="Color Name" value={newMaterial.colorName} onChange={e => setNewMaterial({...newMaterial, colorName: e.target.value})} style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }} />
              <div style={{ display: 'flex', gap: '0.2rem' }}>
                <input type="color" value={newMaterial.colorHex} onChange={e => setNewMaterial({...newMaterial, colorHex: e.target.value})} style={{ width: '100%', height: '32px', padding: '0', background: 'none', border: 'none', cursor: 'pointer' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <CustomNumberInput placeholder="$/kg" value={newMaterial.costPerKg} onChange={val => setNewMaterial({...newMaterial, costPerKg: val.toString()})} style={{ flex: 1 }} />
              <select value={newMaterial.amsSlot} onChange={e => setNewMaterial({...newMaterial, amsSlot: e.target.value})} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0 0.5rem' }}>
                <option value="">Slot: Manual</option>
                <option value="1">Slot: 1</option>
                <option value="2">Slot: 2</option>
                <option value="3">Slot: 3</option>
                <option value="4">Slot: 4</option>
              </select>
              <button onClick={() => handleAddOption('material', newMaterial)} disabled={!newMaterial.name || !newMaterial.costPerKg} style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Add</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {initialMaterials.map(m => (
              <div key={m.id} className="glass-white" style={{ padding: '1rem', borderRadius: '8px', opacity: m.enabled ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <input type="checkbox" checked={m.enabled} onChange={(e) => handleUpdateOption('material', m.id, e.target.checked)} />
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: m.colorHex || 'transparent', border: '1px solid rgba(255,255,255,0.2)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{m.brand} {m.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{m.colorName || 'No Color'} • {m.materialType} • Slot {m.amsSlot || 'None'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteOption('material', m.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>&times;</button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                   <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Cost $/kg</label>
                   <CustomNumberInput 
                      step="0.01"
                      defaultValue={m.costPerKg} 
                      onBlur={(e) => handleUpdateOption('material', m.id, m.enabled, parseFloat(e.target.value))}
                      style={{ width: '80px', fontSize: '0.8rem' }}
                    />
                </div>
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


        {/* Nozzle Diameters */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Nozzle Specs</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                placeholder="Diameter (0.4)" 
                value={newNozzle.diameter} 
                onChange={e => setNewNozzle({...newNozzle, diameter: e.target.value})}
                style={{ flex: 1, padding: '0.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', fontSize: '0.85rem' }} 
              />
              <CustomNumberInput 
                placeholder="Swap Fee $" 
                value={newNozzle.swapFee} 
                onChange={val => setNewNozzle({...newNozzle, swapFee: val.toString()})}
                style={{ width: '100px' }} 
              />
              <button 
                onClick={() => handleAddOption('nozzle', newNozzle)} 
                disabled={!newNozzle.diameter}
                style={{ padding: '0.4rem 0.8rem', background: 'var(--primary)', color: 'black', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
              >Add</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {initialNozzles.map(n => (
              <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.9rem', opacity: n.enabled ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={n.enabled} onChange={(e) => handleUpdateOption('nozzle', n.id, e.target.checked)} />
                  <span>{n.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>(${n.swapFee})</span>
                </div>
                <button onClick={() => handleDeleteOption('nozzle', n.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>&times;</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  );
}
