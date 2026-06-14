import React, { useState, useEffect } from 'react';
import { Upload, Settings, ChevronDown, ChevronUp, Palette, Minus, Plus, ArrowRight, Globe, CheckCircle, FileText, Camera, Shield, Lock, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { SITE_CONFIG } from '../../constants/site';

const QuoteLab = ({
    quoteStep, setQuoteStep,
    isUploading, setIsUploading,
    showAdvanced, setShowAdvanced,
    formData, setFormData
}) => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState({});
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [error, setError] = useState(null);
    const [turnstileToken, setTurnstileToken] = useState('');

    useEffect(() => {
        const initTurnstile = () => {
            const container = document.getElementById('turnstile-container-quote');
            if (window.turnstile && container && !turnstileToken) {
                window.turnstile.render('#turnstile-container-quote', {
                    sitekey: '0x4AAAAAAC6yWDKB2X7isRW7',
                    callback: (token) => setTurnstileToken(token),
                    theme: 'light'
                });
            }
        };

        // Note: In QuoteLab, step 3 must be active for the element to exist.
        // We'll run this on every render, but initTurnstile checks for the element.
        if (window.turnstile) {
            initTurnstile();
        } else {
            const timer = setInterval(() => {
                if (window.turnstile) {
                    initTurnstile();
                    clearInterval(timer);
                }
            }, 500);
            return () => clearInterval(timer);
        }
    });

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const { data, error } = await supabase
                    .from('materials')
                    .select('*')
                    .eq('is_hidden', false)
                    .gt('stock', 0)
                    .order('list_order', { ascending: true });

                if (error) throw error;

                // Transform flat DB structure into family -> [colors] map
                const materialMap = data.reduce((acc, item) => {
                    if (!acc[item.material_family]) acc[item.material_family] = [];
                    acc[item.material_family].push(item.color_name);
                    return acc;
                }, {});

                // Ensure Technician's Choice is always there
                materialMap["Technician's Choice"] = ["Standard Selection"];

                setMaterials(materialMap);

                // Set default if exists in DB and form is empty
                const defaultItem = data.find(item => item.is_default);
                if (defaultItem) {
                    setFormData(prev => {
                        if (!prev.selectedMaterial) {
                            return {
                                ...prev,
                                selectedMaterial: defaultItem.material_family,
                                selectedColors: [defaultItem.color_name, '', '', '']
                            };
                        }
                        return prev;
                    });
                }
            } catch (err) {
                console.error('Error fetching materials:', err);
                // Fallback to minimal state if DB fails
                setMaterials({ "Technician's Choice": ["Standard Selection"] });
            } finally {
                setIsLoadingMaterials(false);
            }
        };

        fetchMaterials();
        // FLASHAUTONOTE: Fetch materials only once on mount. Do not add formData to dependencies to prevent infinite fetch loops.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Validation
        const allowedExts = ['.stl', '.3mf', '.obj'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedExts.includes(ext)) {
            setError('Invalid file format. Please use STL, 3MF, or OBJ.');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setError({ type: 'size_limit_error', message: 'File exceeds 50MB limit' });
            return;
        }

        // 2. Upload to Supabase Storage
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).slice(2, 9)}_${Date.now()}.${fileExt}`;
            const folderId = user ? user.id : `guest_${Math.random().toString(36).slice(2, 11)}`;
            const filePath = `${folderId}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('quotes')
                .upload(filePath, file);

            if (error) throw error;

            setFormData({
                ...formData,
                fileName: file.name,
                storagePath: data.path
            });
            setIsUploading(false);
            setQuoteStep(2);
        } catch (error) {
            console.error('Upload error:', error.message);
            setError('Upload failed. Check your connection and try again.');
            setIsUploading(false);
        }
    };

    const handleTransmit = async (e) => {
        if (e) e.preventDefault();

        // 1. Bot check (Honeypot)
        if (formData._honeypot) {
            console.warn('Spam detected via honeypot.');
            setQuoteStep(4); // Pretend success
            return;
        }

        if (!formData.name || !formData.email) {
            setError('Name and email are required.');
            return;
        }

        if (!turnstileToken) {
            setError('Security verification required');
            return;
        }

        try {
            const { data: quote, error } = await supabase
                .from('quotes')
                .insert({
                    user_id: user?.id || null,
                    name: formData.name,
                    email: formData.email,
                    file_name: formData.fileName,
                    shipping_address: formData.shipping_address,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    material: formData.selectedMaterial,
                    colors: (formData.selectedColors || []).slice(0, formData.colorCount || 1).filter(c => c !== ''),
                    intent: formData.intent,
                    visual_validation: formData.visualValidation,
                    file_path: formData.storagePath,
                    nozzle: formData.nozzle || "0.4mm (Recommended)",
                    infill: formData.infill || "15% (Recommended)",
                    walls: formData.walls || "2 Loops (Recommended)",
                    speed: formData.speed || "Balanced (Recommended)",
                    layer_height: formData.layer_height || "0.20mm (Recommended)",
                    supports: formData.supports || "Auto (Recommended)",
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            // Explicitly trigger notification Edge Function
            const { error: funcError } = await supabase.functions.invoke('send-notification', {
                body: {
                    record: quote,
                    table: 'quotes',
                    type: 'INSERT',
                    turnstile_token: turnstileToken
                }
            });

            if (funcError) throw new Error(`Notification failed: ${funcError.message}`);

            setQuoteStep(4);
        } catch (error) {
            console.error('Submission error:', error.message);
            setError({ type: 'transmit_error', message: 'Something went wrong.' });
        }
    };

    const handleColorChange = (index, value) => {
        const newColors = [...(formData.selectedColors || ['', '', '', ''])];
        newColors[index] = value;
        setFormData({ ...formData, selectedColors: newColors });
    };

    return (
        <div className="bg-[#F2F1EF] border border-gray-300 shadow-2xl rounded-sm overflow-hidden text-[#1A1B1E] selection:bg-[#D4A017] selection:text-[#1A1B1E]">
            <div className="flex h-1 bg-gray-300/30">
                <div className={`transition-all duration-700 bg-[#D4A017] ${quoteStep === 1 ? 'w-1/4' : quoteStep === 2 ? 'w-1/2' : quoteStep === 3 ? 'w-3/4' : 'w-full'}`}></div>
            </div>
            {user ? (
                <div className="px-8 pt-4 flex justify-end">
                    <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4A017] bg-[#D4A017]/5 px-3 py-1 rounded-full border border-[#D4A017]/10">
                        <div className="w-1.5 h-1.5 bg-[#D4A017] rounded-full animate-pulse"></div>
                        <span>Signed in as {user.email}</span>
                    </div>
                </div>
            ) : null /* FLASHAUTONOTE: Do NOT add a sign in banner for guests. Flour City Labs uses guest-first quoting. */}
            
            {error && (
                <div className="mx-8 md:mx-14 mt-8 p-4 rounded-sm border border-red-500/30 bg-red-500/5 flex items-start space-x-3 text-[#1A1B1E] animate-in fade-in slide-in-from-top-2 relative">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                    <div className="flex-1 text-sm font-medium leading-relaxed">
                        {error?.type === 'transmit_error' ? (
                            <>Something went wrong sending that. Try again, or email me at <a href={`mailto:${SITE_CONFIG.email}`} className="font-bold text-red-600 hover:text-red-800 transition-colors">{SITE_CONFIG.email}</a>.</>
                        ) : error?.type === 'size_limit_error' ? (
                            <>File exceeds 50MB limit. Email me at <a href={`mailto:${SITE_CONFIG.email}`} className="font-bold text-red-600 hover:text-red-800 transition-colors">{SITE_CONFIG.email}</a> for larger files.</>
                        ) : (
                            <>{error}</>
                        )}
                    </div>
                    <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100 transition-opacity absolute top-4 right-4">
                        <Plus className="w-4 h-4 rotate-45 transform" />
                    </button>
                </div>
            )}

            <div className="p-8 md:p-14 text-left">
                {quoteStep === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center space-y-2">
                            <h3 className="font-display text-4xl font-black uppercase italic tracking-tighter">1. Upload your file</h3>
                            <p className="text-gray-500 font-medium text-sm italic tracking-tight text-center">STL, 3MF, or OBJ. Max 50MB.</p>
                        </div>

                        <label className="group border-2 border-dashed border-gray-300 rounded-sm p-20 flex flex-col items-center justify-center text-center space-y-6 hover:border-[#D4A017] hover:bg-[#2C3E50]/10 transition-all cursor-pointer bg-[#2C3E50]/5 relative overflow-hidden">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept=".stl,.3mf,.obj" />
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                                <Shield size={64} className="text-[#D4A017]" />
                            </div>

                            {isUploading ? (
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-[#D4A017]">Uploading...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-[#1A1B1E] flex items-center justify-center group-hover:bg-[#D4A017] transition-all shadow-lg relative z-10">
                                        <Upload className="w-8 h-8 text-white group-hover:text-[#1A1B1E]" />
                                    </div>
                                    <div className="space-y-1 relative z-10">
                                        <p className="text-xl font-black uppercase tracking-tighter">Select Your File</p>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>
                )}

                {quoteStep === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center space-y-2 text-center text-[#1A1B1E]">
                            <h3 className="font-display text-4xl font-black uppercase italic tracking-tighter">2. Configure your print</h3>
                            <p className="text-gray-500 font-medium text-sm italic tracking-tight text-center">File: {formData.fileName}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10 text-[#1A1B1E]">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Filament Selection</label>
                                    <select
                                        value={formData.selectedMaterial}
                                        onChange={(e) => setFormData({ ...formData, selectedMaterial: e.target.value, selectedColors: ['', '', '', ''] })}
                                        className="w-full bg-white border border-gray-300 p-4 rounded-sm font-medium text-sm text-[#1A1B1E] outline-none focus:border-[#D4A017] cursor-pointer disabled:opacity-50"
                                        disabled={isLoadingMaterials}
                                    >
                                        {isLoadingMaterials ? (
                                            <option>Fetching stock...</option>
                                        ) : (
                                            Object.keys(materials).map(mat => <option key={mat} value={mat}>{mat}</option>)
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Multi-Color Config</label>
                                        <div className="flex items-center space-x-2">
                                            <button type="button" onClick={() => setFormData({ ...formData, colorCount: Math.max(1, (formData.colorCount || 1) - 1) })} className="p-1 border border-gray-300 bg-white hover:bg-gray-100"><Minus size={12} /></button>
                                            <span className="text-xs font-black w-4 text-center">{formData.colorCount || 1}</span>
                                            <button type="button" onClick={() => setFormData({ ...formData, colorCount: Math.min(4, (formData.colorCount || 1) + 1) })} className="p-1 border border-gray-300 bg-white hover:bg-gray-100"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {[...Array(formData.colorCount || 1)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-1">
                                                <Palette size={14} className="text-[#D4A017]" />
                                                <select
                                                    value={formData.selectedColors?.[i] || ''}
                                                    onChange={(e) => handleColorChange(i, e.target.value)}
                                                    className="flex-1 bg-white border border-gray-300 p-3 rounded-sm font-medium text-sm text-[#1A1B1E] outline-none focus:border-[#D4A017] cursor-pointer disabled:opacity-50"
                                                    disabled={isLoadingMaterials}
                                                >
                                                    {isLoadingMaterials ? (
                                                        <option>Fetching stock...</option>
                                                    ) : (
                                                        <>
                                                            <option value="">{`SELECT COLOR ${i + 1}`}</option>
                                                            {materials[formData.selectedMaterial]?.map(color => <option key={color} value={color}>{color}</option>)}
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-[#2C3E50]/5 border border-gray-300 rounded-sm">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Shield size={16} className="text-[#D4A017]" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Note: how parts ship</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">Parts ship with supports intact to protect details in transit.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Project Intent</label>
                                    <textarea
                                        value={formData.intent}
                                        onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                                        placeholder="Describe the part's function or tolerance needs..."
                                        className="w-full bg-white border border-gray-300 p-4 rounded-sm font-medium text-sm text-[#1A1B1E] outline-none focus:border-[#D4A017] h-32"
                                    ></textarea>
                                </div>

                                <label className="flex items-start space-x-4 p-4 border border-gray-300 bg-white/50 rounded-sm cursor-pointer group hover:border-[#D4A017] transition-colors">
                                    <div className="relative mt-1 flex items-center justify-center shrink-0 w-4 h-4">
                                        <input
                                            type="checkbox"
                                            className="appearance-none w-full h-full bg-white border-2 border-gray-300 rounded-[2px] checked:bg-[#D4A017] checked:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30 transition-all cursor-pointer m-0 cursor-pointer"
                                            checked={formData.visualValidation || false}
                                            onChange={(e) => setFormData({ ...formData, visualValidation: e.target.checked })}
                                        />
                                        <Check strokeWidth={4} className={`absolute w-3 h-3 text-[#1A1B1E] pointer-events-none transition-opacity ${formData.visualValidation ? 'opacity-100' : 'opacity-0'}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                                            <Camera size={12} className="text-[#D4A017]" />
                                            <span>Request Visual Validation</span>
                                        </p>
                                        <p className="text-[9px] text-gray-500 leading-tight italic text-left">Receive photos of your finished part via email before it ships.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-6">
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2C3E50] hover:text-[#D4A017] transition-colors">
                                <Settings size={14} /><span>Advanced Print Settings</span>{showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <button onClick={() => setQuoteStep(3)} className="w-full md:w-auto px-10 py-4 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center space-x-4 hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all shadow-xl">
                                <span>Lock in settings</span><ArrowRight size={14} />
                            </button>
                        </div>

                        {showAdvanced && (
                            <div className="p-10 bg-[#2C3E50]/5 border border-gray-300 rounded-sm grid md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-top-4">
                                {[
                                    { id: 'nozzle', label: "Nozzle Size", options: ["0.4mm (Recommended)", "0.2mm (Detail)", "0.6mm (Industrial)", "0.8mm (Structural)", "Technician's Choice"] },
                                    { id: 'infill', label: "Infill Density", options: ["15% (Recommended)", "5% (Light)", "40% (Structural)", "100% (Solid)", "Technician's Choice"] },
                                    { id: 'walls', label: "Wall Count", options: ["2 Loops (Recommended)", "3 Loops (Heavy)", "6+ Loops (Industrial)", "Technician's Choice"] },
                                    { id: 'speed', label: "Print Speed", options: ["Balanced (Recommended)", "High-Resolution", "Draft", "Technician's Choice"] },
                                    { id: 'layer_height', label: "Layer Height", options: ["0.20mm (Recommended)", "0.08mm (Fine)", "0.28mm (Draft)", "Technician's Choice"] },
                                    { id: 'supports', label: "Support Type", options: ["Auto (Recommended)", "None Needed", "Included in File", "Tree Supports", "Technician's Choice"] }
                                ].map((cfg) => (
                                    <div key={cfg.id} className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{cfg.label}</label>
                                        <select
                                            value={formData[cfg.id] || cfg.options[0]}
                                            onChange={(e) => setFormData({ ...formData, [cfg.id]: e.target.value })}
                                            className="w-full bg-white border border-gray-300 p-3 rounded-sm font-medium text-sm text-[#1A1B1E] outline-none focus:border-[#D4A017] cursor-pointer"
                                        >
                                            {cfg.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {quoteStep === 3 && (
                    <div className="space-y-10 animate-in fade-in zoom-in-95 text-[#1A1B1E]">
                        <div className="text-center space-y-2">
                            <h3 className="font-display text-4xl font-black uppercase italic tracking-tighter">3. Send for review</h3>
                            <p className="text-gray-500 font-medium text-sm italic text-center">I'll review your file personally and email a quote within 24 hours.</p>
                        </div>
                        <form onSubmit={handleTransmit} className="max-w-md mx-auto space-y-4">
                            {/* Honeypot field (hidden from humans) */}
                            <input 
                                type="text" 
                                name="_honeypot" 
                                style={{ display: 'none' }} 
                                tabIndex="-1" 
                                autoComplete="off"
                                value={formData._honeypot || ''}
                                onChange={(e) => setFormData({ ...formData, _honeypot: e.target.value })}
                            />

                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium text-[#1A1B1E] outline-none focus:border-[#D4A017]"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    required
                                    className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium text-[#1A1B1E] outline-none focus:border-[#D4A017]"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-200">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 block pb-2">Shipping</label>
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    required
                                    className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium text-[#1A1B1E] outline-none focus:border-[#D4A017]"
                                    value={formData.shipping_address || ''}
                                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                />
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        required
                                        className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium text-[#1A1B1E] outline-none focus:border-[#D4A017]"
                                        value={formData.city || ''}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            placeholder="State"
                                            required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium text-[#1A1B1E] outline-none focus:border-[#D4A017]"
                                            value={formData.state || ''}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Zip"
                                            required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium text-[#1A1B1E] outline-none focus:border-[#D4A017]"
                                            value={formData.zip || ''}
                                            onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-[#1A1B1E] text-white rounded-sm space-y-3 shadow-lg">
                                <div className="flex items-center space-x-3 text-[#D4A017]">
                                    <Globe size={18} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em]">Shipping Info</p>
                                </div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-relaxed text-left">Nationwide shipping from Rochester. Same-day handoff for local orders.</p>
                            </div>

                            {/* Turnstile Container */}
                            <div className="flex justify-center py-4">
                                <div id="turnstile-container-quote"></div>
                            </div>

                            {/* Inline script callback moved back to manual render for reliability */}

                            <button
                                type="submit"
                                disabled={!turnstileToken}
                                className="w-full py-6 bg-[#D4A017] text-[#1A1B1E] font-black uppercase text-sm tracking-[0.4em] hover:bg-[#1A1B1E] hover:text-white transition-all shadow-2xl mt-4 disabled:opacity-50"
                            >
                                Send for review
                            </button>
                        </form>
                    </div>
                )}

                {quoteStep === 4 && (
                    <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                        <CheckCircle className="w-24 h-24 text-green-700 mx-auto" />
                        <div className="space-y-4 text-[#1A1B1E]">
                            <h3 className="font-display text-5xl font-black uppercase tracking-tighter text-center">IN THE QUEUE.</h3>
                            <div className="w-16 h-1 bg-[#D4A017] mx-auto"></div>
                            <p className="text-gray-600 max-w-sm mx-auto font-medium leading-relaxed italic opacity-90 text-center">
                                Got it. I'll personally review your design and email a quote within 24 hours.
                            </p>
                        </div>
                        <button 
                            onClick={() => setQuoteStep(1)} 
                            className="px-8 py-3 bg-white border border-gray-300 text-[10px] font-black uppercase tracking-[0.4em] text-[#1A1B1E] hover:border-[#D4A017] hover:text-[#D4A017] transition-all flex items-center justify-center space-x-3 mx-auto shadow-sm"
                        >
                            <FileText size={14} />
                            <span>Start another print</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuoteLab;

