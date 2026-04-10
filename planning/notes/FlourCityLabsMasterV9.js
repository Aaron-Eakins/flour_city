import React, { useState, useEffect } from 'react';
import {
    Upload, Settings, History, ChevronRight, Layers, ShieldCheck, Cpu,
    Clock, Box, FileText, Menu, X, Zap, Hammer, Gift, Wrench, Shield,
    Info, Beaker, Thermometer, ArrowRight, CheckCircle, Palette,
    Plus, Minus, Activity, Gauge, ChevronDown, ChevronUp, Waves, Anchor, Wind,
    FileCode, Eye, Truck, Search, BarChart3, AlertCircle, Sparkles, Compass,
    MapPin, Mail, MessageSquare, Camera, Globe, Scale, Lock, Image as ImageIcon
} from 'lucide-react';

// --- DATA SOURCE OF TRUTH ---

const colorDatabase = {
    "PLA - Matte": ["Slate Grey", "High Falls Ochre", "Charcoal Black", "Cloud White", "Sage Green"],
    "PLA - Silk": ["Antique Gold", "Sterling Silver", "Polished Copper", "Deep Emerald", "Ruby Red"],
    "PLA - Standard": ["Signal Red", "Royal Blue", "Bright Yellow", "Forest Green", "Basic White"],
    "PETG - Functional": ["Translucent Clear", "Solid Black", "Solid White", "Industrial Grey"],
    "Technician's Choice": ["Suggest Based on Intent"]
};

// --- SHARED BRAND COMPONENTS ---

const LogoIcon = ({ className = "w-10 h-10" }) => (
    <svg viewBox="0 0 100 100" className={`${className} fill-current text-[#D4A017]`}>
        <g className="animate-spin-slow origin-center">
            <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z" opacity=".2" />
            <path d="M50 10v10M50 80v10M10 50h10M80 50h10M21.7 21.7l7.1 7.1M71.2 71.2l7.1 7.1M21.7 78.3l7.1-7.1M71.2 28.8l7.1-7.1" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="6" fill="currentColor" className="animate-pulse-slow" />
    </svg>
);

const OpticsIcon = ({ className = "w-32 h-32" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="50" cy="50" r="45" strokeOpacity="0.2" strokeDasharray="2 4" />
        <circle cx="50" cy="50" r="30" />
        <path d="M50 20 L50 10 M50 90 L50 80 M20 50 L10 50 M90 50 L80 50" />
        <path d="M50 30 L65 50 L50 70 L35 50 Z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
        <path d="M30 30 L70 70 M70 30 L30 70" strokeOpacity="0.2" />
    </svg>
);

const Navigation = ({ view, setView, isScrolled, isHome }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navBg = (isHome && !isScrolled && !isMenuOpen) ? 'bg-transparent' : 'bg-[#1A1B1E]';
    const navItems = ['home', 'materials', 'gallery', 'process', 'heritage', 'contact'];

    const handleLinkClick = (target) => {
        setView(target);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 py-5 ${navBg} ${isScrolled || !isHome || isMenuOpen ? 'shadow-2xl border-b border-white/5' : ''}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[#F2F1EF]">
                <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleLinkClick('home')}>
                    <LogoIcon className="w-8 h-8" />
                    <div>
                        <h1 className="text-lg font-black tracking-tighter uppercase leading-none">FLOUR CITY <span className="text-[#D4A017]">LABS</span></h1>
                        <p className="text-[9px] tracking-[0.2em] text-slate-500 uppercase font-bold leading-none mt-1">Rochester, NY</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center space-x-8 text-[11px] font-black tracking-widest uppercase text-[#F2F1EF]">
                    {navItems.map((item) => (
                        <button key={item} onClick={() => handleLinkClick(item)} className={`hover:text-[#D4A017] transition-colors ${view === item ? 'text-[#D4A017]' : ''}`}>{item}</button>
                    ))}
                    <button
                        onClick={() => { handleLinkClick('home'); setTimeout(() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                        className="px-6 py-2 border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all rounded-sm font-black"
                    >
                        QUOTELAB
                    </button>
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[#F2F1EF] hover:text-[#D4A017] transition-colors">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#1A1B1E] border-t border-white/5 animate-in slide-in-from-top duration-300 overflow-hidden">
                    <div className="flex flex-col p-6 space-y-4 text-[12px] font-black tracking-[0.3em] uppercase text-[#F2F1EF]">
                        {navItems.map((item) => (
                            <button key={item} onClick={() => handleLinkClick(item)} className={`text-left py-3 border-b border-white/5 ${view === item ? 'text-[#D4A017]' : 'text-gray-400'}`}>{item}</button>
                        ))}
                        <button onClick={() => { handleLinkClick('home'); setTimeout(() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left py-4 text-[#D4A017] font-black">ACCESS QUOTELAB</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

const Footer = ({ setView }) => (
    <footer className="bg-[#1A1B1E] text-white pt-20 pb-10 border-t border-white/5 selection:bg-[#D4A017] selection:text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 text-center md:text-left text-[#F2F1EF]">
            <div className="space-y-6">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                    <div className="w-10 h-10 border-2 border-[#D4A017] flex items-center justify-center font-black text-[#D4A017]">FCL</div>
                    <h4 className="text-2xl font-bold tracking-tighter uppercase font-black">Flour City Labs</h4>
                </div>
                <p className="text-gray-500 max-w-sm text-sm mx-auto md:mx-0 font-medium leading-relaxed italic opacity-70">
                    Engineering trust in Rochester's additive future since 2026.
                </p>
            </div>
            <div className="flex flex-col md:items-end justify-center space-y-4 text-xs font-black uppercase tracking-widest text-gray-400">
                <p>© 2026 FLOUR CITY LABS. BUILT IN ROCHESTER.</p>
                <p className="text-white opacity-60 lowercase font-bold tracking-tighter">solutions@flourcitylabs.com</p>
            </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <div className="flex space-x-8">
                <button onClick={() => { setView('tos'); window.scrollTo(0, 0); }} className="hover:text-[#D4A017] transition-colors">Terms of Service</button>
                <button onClick={() => { setView('privacy'); window.scrollTo(0, 0); }} className="hover:text-[#D4A017] transition-colors">Privacy Policy</button>
            </div>
            <p>FCL LAB 1 SATELLITE</p>
        </div>
    </footer>
);

// --- QUOTELAB COMPONENT ---

const QuoteLab = ({
    quoteStep, setQuoteStep,
    isUploading, setIsUploading,
    showAdvanced, setShowAdvanced,
    formData, setFormData
}) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, fileName: file.name, fileContent: reader.result.split(',')[1] });
            setIsUploading(false);
            setQuoteStep(2);
        };
        reader.readAsDataURL(file);
    };

    const handleColorChange = (index, value) => {
        const newColors = [...formData.selectedColors];
        newColors[index] = value;
        setFormData({ ...formData, selectedColors: newColors });
    };

    return (
        <div className="bg-[#F2F1EF] border border-gray-300 shadow-2xl rounded-sm overflow-hidden text-[#1A1B1E] selection:bg-[#D4A017] selection:text-[#1A1B1E]">
            <div className="flex h-1 bg-gray-300/30">
                <div className={`transition-all duration-700 bg-[#D4A017] ${quoteStep === 1 ? 'w-1/4' : quoteStep === 2 ? 'w-1/2' : quoteStep === 3 ? 'w-3/4' : 'w-full'}`}></div>
            </div>
            <div className="p-8 md:p-14 text-left">
                {quoteStep === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter">1. Project Entry</h3>
                            <p className="text-gray-500 font-medium text-sm italic tracking-tight text-center">STL, 3MF, or OBJ formats accepted. (Max 50MB)</p>
                        </div>
                        <label className="group border-2 border-dashed border-gray-300 rounded-sm p-20 flex flex-col items-center justify-center text-center space-y-6 hover:border-[#D4A017] hover:bg-[#2C3E50]/10 transition-all cursor-pointer bg-[#2C3E50]/5 relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                            {isUploading ? (
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-[#D4A017]">Securing Pipeline...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-[#1A1B1E] flex items-center justify-center group-hover:bg-[#D4A017] transition-all shadow-lg">
                                        <Upload className="w-8 h-8 text-white group-hover:text-[#1A1B1E]" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black uppercase tracking-tighter">Select CAD Geometry</p>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] opacity-60 italic">Manual Technical Review Active</p>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>
                )}

                {quoteStep === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter">2. Logic Configuration</h3>
                            <p className="text-gray-500 font-medium text-sm italic tracking-tight text-center">Active Project: {formData.fileName}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10 text-[#1A1B1E]">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Filament Selection</label>
                                    <select
                                        value={formData.selectedMaterial}
                                        onChange={(e) => setFormData({ ...formData, selectedMaterial: e.target.value, selectedColors: ['', '', '', ''] })}
                                        className="w-full bg-[#2C3E50]/5 border border-gray-300 p-4 rounded-sm font-bold uppercase text-xs outline-none focus:border-[#D4A017]"
                                    >
                                        {Object.keys(colorDatabase).map(mat => <option key={mat}>{mat}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Multi-Color Config</label>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => setFormData({ ...formData, colorCount: Math.max(1, formData.colorCount - 1) })} className="p-1 border border-gray-300 bg-white hover:bg-gray-100"><Minus size={12} /></button>
                                            <span className="text-xs font-black w-4 text-center">{formData.colorCount}</span>
                                            <button onClick={() => setFormData({ ...formData, colorCount: Math.min(4, formData.colorCount + 1) })} className="p-1 border border-gray-300 bg-white hover:bg-gray-100"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {[...Array(formData.colorCount)].map((_, i) => (
                                            <div key={i} className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-1">
                                                <Palette size={14} className="text-[#D4A017]" />
                                                <select
                                                    value={formData.selectedColors[i]}
                                                    onChange={(e) => handleColorChange(i, e.target.value)}
                                                    className="flex-1 bg-[#2C3E50]/5 border border-gray-300 p-3 rounded-sm font-bold uppercase text-[10px] outline-none focus:border-[#D4A017]"
                                                >
                                                    <option value="">{`SELECT COLOR ${i + 1}`}</option>
                                                    {colorDatabase[formData.selectedMaterial]?.map(color => <option key={color} value={color}>{color}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-[#2C3E50]/5 border border-gray-300 rounded-sm">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <Shield size={16} className="text-[#D4A017]" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Lab Note: Support Policy</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">Parts ship as Raw Lab Output with supports intact to protect geometry during transit.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Project Intent</label>
                                    <textarea
                                        value={formData.intent}
                                        onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                                        placeholder="Describe the part's function or tolerance needs..."
                                        className="w-full bg-[#2C3E50]/5 border border-gray-300 p-4 rounded-sm font-medium text-sm outline-none focus:border-[#D4A017] h-32"
                                    ></textarea>
                                </div>

                                <label className="flex items-start space-x-4 p-4 border border-gray-300 bg-white/50 rounded-sm cursor-pointer group hover:border-[#D4A017] transition-colors">
                                    <input
                                        type="checkbox"
                                        className="mt-1 accent-[#D4A017] w-4 h-4"
                                        checked={formData.visualValidation}
                                        onChange={(e) => setFormData({ ...formData, visualValidation: e.target.checked })}
                                    />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                                            <Camera size={12} className="text-[#D4A017]" />
                                            <span>Request Visual Validation</span>
                                        </p>
                                        <p className="text-[9px] text-gray-500 leading-tight italic">Receive high-res macro photos of finished parts via email before they enter the shipping pipeline.</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-6">
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2C3E50] hover:text-[#D4A017] transition-colors">
                                <Settings size={14} /><span>Advanced Engineering Params</span>{showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                            <button onClick={() => setQuoteStep(3)} className="w-full md:w-auto px-10 py-4 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center space-x-4 hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all shadow-xl">
                                <span>Lock Parameters</span><ArrowRight size={14} />
                            </button>
                        </div>

                        {showAdvanced && (
                            <div className="p-10 bg-[#2C3E50]/5 border border-gray-300 rounded-sm grid md:grid-cols-3 gap-10 animate-in fade-in slide-in-from-top-4">
                                {[
                                    { id: 'nozzle', label: "Nozzle Architecture", options: ["0.4mm (Std)", "0.2mm (Detail)", "0.6mm (Ind)", "0.8mm (Rapid)"] },
                                    { id: 'infill', label: "Core Density", options: ["15% (Std)", "5% (Light)", "40% (Structural)", "100% (Solid)"] },
                                    { id: 'walls', label: "Wall Count", options: ["2 Loops (Std)", "3 Loops (Heavy)", "6+ Loops (Ind)"] },
                                    { id: 'speed', label: "Speed Calibration", options: ["Balanced", "High-Resolution (Slow)", "Draft (Fast)"] },
                                    { id: 'resolution', label: "Layer Resolution", options: ["0.20mm (Std)", "0.08mm (Fine)", "0.28mm (Draft)"] },
                                    { id: 'supports', label: "Scaffolding Type", options: ["Auto (Tech Choice)", "No Supports", "Tree Supports"] }
                                ].map((cfg) => (
                                    <div key={cfg.id} className="space-y-3">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">{cfg.label}</label>
                                        <select
                                            onChange={(e) => setFormData({ ...formData, [cfg.id]: e.target.value })}
                                            className="w-full bg-white border border-gray-300 p-3 rounded-sm font-black text-[10px] uppercase outline-none focus:border-[#D4A017]"
                                        >
                                            {cfg.options.map(opt => <option key={opt}>{opt}</option>)}
                                            <option>Technician's Choice</option>
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
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter">3. Lab Connect</h3>
                            <p className="text-gray-500 font-medium text-sm italic text-center">Secure submission for professional 24-hour review.</p>
                        </div>
                        <div className="max-w-md mx-auto space-y-4">
                            <input type="text" placeholder="FULL NAME" required className="w-full p-5 bg-[#2C3E50]/5 border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            <input type="email" placeholder="EMAIL ADDRESS" required className="w-full p-5 bg-[#2C3E50]/5 border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            <div className="p-5 bg-[#1A1B1E] text-white rounded-sm space-y-3 shadow-lg">
                                <div className="flex items-center space-x-3 text-[#D4A017]">
                                    <Globe size={18} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.15em]">Lab-to-Door Fulfillment</p>
                                </div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-relaxed">Secure nationwide shipping from FCL Lab 1. One-day regional transit for Rochester-based orders.</p>
                            </div>
                            <button onClick={() => setQuoteStep(4)} className="w-full py-6 bg-[#D4A017] text-[#1A1B1E] font-black uppercase text-sm tracking-[0.4em] hover:bg-[#1A1B1E] hover:text-white transition-all shadow-2xl mt-4">
                                TRANSMIT TO LAB
                            </button>
                        </div>
                    </div>
                )}

                {quoteStep === 4 && (
                    <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                        <CheckCircle className="w-24 h-24 text-green-700 mx-auto" />
                        <div className="space-y-4 text-[#1A1B1E]">
                            <h3 className="text-5xl font-black uppercase tracking-tighter text-center">IN THE LAB.</h3>
                            <div className="w-16 h-1 bg-[#D4A017] mx-auto"></div>
                            <p className="text-gray-600 max-w-sm mx-auto font-medium leading-relaxed italic opacity-90 text-center">
                                Project secured. A lab technician will personally review your design and email a professional quote within 24 hours.
                            </p>
                        </div>
                        <button onClick={() => setQuoteStep(1)} className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-[#D4A017] transition-colors flex items-center justify-center space-x-2 mx-auto uppercase">
                            <FileText size={14} /><span>Initiate New Project</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- VIEW DEFINITIONS ---

const HomeView = (props) => (
    <div className="animate-in fade-in duration-1000">
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#1A1B1E]">
            <div className="absolute inset-0 z-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute border-t border-slate-500 w-full" style={{ top: `${i * 5}%`, transform: `skewY(-2deg)` }}></div>
                ))}
            </div>
            <div className="relative z-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center text-left">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold">Rochester Built. Layered with Purpose.</span>
                        <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter uppercase">LOCAL SCALE. <br /><span className="text-transparent border-text stroke-white" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.8)' }}>MODERN CRAFT.</span></h2>
                    </div>
                    <p className="text-gray-400 text-lg max-w-md leading-relaxed border-l-2 border-[#D4A017] pl-6 font-medium">Boutique additive manufacturing for engineers and designers. We bridge digital intent and physical reality with expert human oversight.</p>
                    <button onClick={() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-5 bg-[#D4A017] text-[#1A1B1E] font-black rounded-sm flex items-center space-x-3 hover:scale-105 transition-transform uppercase tracking-widest text-sm shadow-xl">
                        <span>Enter QuoteLab</span><ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative hidden md:block">
                    <div className="relative w-full aspect-square flex items-center justify-center">
                        <div className="absolute w-96 h-96 border border-[#D4A017]/20 rounded-full animate-spin-slow"></div>
                        <div className="relative z-10 w-80 h-80 bg-gradient-to-br from-[#2C3E50] to-[#1A1B1E] rounded-2xl shadow-2xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden text-[#F2F1EF]">
                            <div className="flex justify-between items-start">
                                <Box className="w-12 h-12 text-[#D4A017]" />
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">Lab Status</div>
                                    <div className="text-xl font-black tracking-tighter uppercase italic mt-1">Ready to Print</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#D4A017] w-1/3 animate-pulse"></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest">
                                    <span>Queue: Active</span><span>Est. 24-48h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="quote-section" className="py-24 bg-[#F2F1EF] scroll-mt-20 border-b border-gray-200 text-[#1A1B1E]">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <header className="mb-12 space-y-2">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">The QuoteLab</h2>
                    <p className="text-gray-500 text-sm font-medium">Boutique pricing with professional technical data capture.</p>
                </header>
                <QuoteLab {...props} />
            </div>
        </section>

        <section className="bg-[#2C3E50] py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center text-[#F2F1EF]">
                <div className="relative group text-center flex justify-center">
                    <div className="absolute -inset-4 border border-[#D4A017]/30 translate-x-8 translate-y-8 transition-transform"></div>
                    <div className="relative aspect-square w-full max-w-[500px] bg-[#1A1B1E] overflow-hidden shadow-2xl flex items-center justify-center">
                        <LogoIcon className="w-64 h-64 opacity-10" />
                        <div className="absolute bottom-10 left-10 z-20 text-left">
                            <h4 className="text-white text-3xl font-black italic tracking-tighter uppercase leading-none">Rochester DNA</h4>
                            <p className="text-[#D4A017] font-mono text-xs tracking-[0.4em] font-bold uppercase">Built to Last</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-8 text-left">
                    <div className="inline-block px-4 py-1 border border-[#D4A017] text-[#D4A017] text-[10px] font-black tracking-[0.4em] uppercase">Our Mission</div>
                    <h3 className="text-5xl font-black tracking-tighter leading-none uppercase text-white">MAKING IS IN <br /><span className="text-[#D4A017]">OUR BLOOD.</span></h3>
                    <p className="text-gray-300 text-lg leading-relaxed font-medium italic">"Continuing a two-hundred-year-old conversation about how things are made in the Flour City."</p>
                    <button onClick={() => props.setView('heritage')} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A017] hover:text-white transition-colors">
                        <span>Read the Archive</span><ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </section>
    </div>
);

const MaterialsView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto px-6 text-[#1A1B1E]">
            <header className="mb-20 space-y-4 text-left">
                <span className="text-[#D4A017] font-mono tracking-[0.4em] uppercase text-xs font-black">Stocked for Quality</span>
                <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic leading-none text-left">The Material <br /> <span className="text-transparent border-text" style={{ WebkitTextStroke: '1px #1A1B1E' }}>Library</span></h2>
                <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Curated high-performance polymers, optimized for our specialized hotends.</p>
            </header>
            <div className="grid md:grid-cols-2 gap-12 text-[#1A1B1E]">
                <div className="p-10 bg-[#2C3E50] text-[#F2F1EF] rounded-sm shadow-2xl relative overflow-hidden group">
                    <Beaker className="absolute -top-4 -right-4 w-40 h-40 text-white/5 opacity-20" />
                    <div className="relative z-10 space-y-8 text-left">
                        <div className="inline-block px-3 py-1 bg-[#D4A017] text-[#1A1B1E] text-[10px] font-black uppercase tracking-widest">Aesthetic Focus</div>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">PLA Series</h3>
                        <p className="text-slate-400 font-medium leading-relaxed">The industry standard for aesthetic precision. Ideal for high-detail visual models and architectural prototypes.</p>
                        <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 font-bold text-xs uppercase tracking-widest">
                            <div className="space-y-1"><p className="text-[#D4A017]">Variates</p><p>Matte, Silk, Standard</p></div>
                            <div className="space-y-1"><p className="text-[#D4A017]">Stability</p><p>Up to 55°C</p></div>
                        </div>
                    </div>
                </div>
                <div className="p-10 bg-[#EAE8E4] border border-gray-300 rounded-sm shadow-2xl relative overflow-hidden group text-[#1A1B1E]">
                    <Wrench className="absolute -top-4 -right-4 w-40 h-40 text-[#1A1B1E]/5 opacity-20" />
                    <div className="relative z-10 space-y-8 text-left text-[#1A1B1E]">
                        <div className="inline-block px-3 py-1 bg-[#2C3E50] text-white text-[10px] font-black uppercase tracking-widest">Functional Focus</div>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">PETG Functional</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">Industrial toughness for parts subject to stress. Best for outdoor fixtures or heat-exposed prototypes.</p>
                        <div className="grid grid-cols-2 gap-6 border-t border-gray-300 pt-8 font-bold text-xs uppercase tracking-widest text-[#1A1B1E]">
                            <div className="space-y-1"><p className="text-[#4A6982]">Resilience</p><p>Chemical/Impact</p></div>
                            <div className="space-y-1"><p className="text-[#4A6982]">Max Temp</p><p>Up to 80°C</p></div>
                        </div>
                        <div className="bg-[#1A1B1E]/5 p-4 border-l-4 border-[#D4A017] italic text-xs font-medium text-gray-600">
                            "If your part lives in a Rochester workshop or a car interior, PETG is our mandatory standard."
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const GalleryView = () => {
    const galleryItems = [
        { title: "Archival Miniature", material: "PLA Matte", resolution: "0.08mm Fine", nozzle: "0.2mm", tag: "Detailed" },
        { title: "Industrial Pivot", material: "PETG Functional", resolution: "0.28mm Rough", nozzle: "0.6mm", tag: "Strength" },
        { title: "AMS Corporate Logo", material: "PLA Multi-Color", resolution: "0.20mm Std", nozzle: "0.4mm", tag: "Aesthetic" },
        { title: "Structural Housing", material: "PETG Solid", resolution: "0.20mm Std", nozzle: "0.4mm", tag: "Functional" },
        { title: "Rapid Gear Proto", material: "PLA Standard", resolution: "0.28mm Draft", nozzle: "0.8mm", tag: "Speed" },
        { title: "Archival Stone Dial", material: "PLA Matte Slate", resolution: "0.12mm Detail", nozzle: "0.4mm", tag: "Detailed" }
    ];

    return (
        <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-20 space-y-4 text-left">
                    <span className="text-[#D4A017] font-mono tracking-[0.4em] uppercase text-xs font-black">Visual Validation</span>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-left">Lab <br /> <span className="text-transparent border-text" style={{ WebkitTextStroke: '1px #1A1B1E' }}>Outputs.</span></h2>
                    <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">A visual archive of technical fidelity across our material library and nozzle architectures.</p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {galleryItems.map((item, idx) => (
                        <div key={idx} className="group bg-[#EAE8E4] border border-gray-300 rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                            <div className="aspect-square bg-[#1A1B1E] relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                                <ImageIcon size={64} className="text-[#D4A017] opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 right-4 px-3 py-1 bg-[#D4A017] text-[#1A1B1E] text-[9px] font-black uppercase tracking-widest">{item.tag}</div>
                            </div>
                            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black uppercase italic tracking-tighter">{item.title}</h4>
                                    <p className="text-[10px] font-black text-[#D4A017] uppercase tracking-widest">{item.material}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-300 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                    <div className="space-y-1">
                                        <p className="opacity-50">Resolution</p>
                                        <p className="text-[#1A1B1E]">{item.resolution}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="opacity-50">Nozzle</p>
                                        <p className="text-[#1A1B1E]">{item.nozzle}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProcessView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-1000 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6">
            <header className="mb-16 space-y-4 text-left">
                <span className="text-[#D4A017] font-mono tracking-[0.4em] uppercase text-xs font-black">Industrial Lifecycle</span>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-left">How the Lab <br /> <span className="text-transparent border-text" style={{ WebkitTextStroke: '1px #1A1B1E' }}>Works.</span></h2>
                <p className="text-gray-500 max-w-xl font-medium leading-relaxed text-lg text-left">A human-in-the-loop workflow designed to eliminate digital guesswork.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8 mb-20 text-left">
                <div className="p-8 bg-[#1A1B1E] text-white rounded-sm space-y-4">
                    <div className="flex items-center space-x-3 text-[#D4A017]">
                        <Shield size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest italic">The Technician's Shield</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        CAD structural integrity is the client's responsibility. Designs failing due to geometry constraints (non-manifold edges/thin walls) are subject to a **$25.00 Lab Reset Fee** to cover material and setup recovery.
                    </p>
                </div>
                <div className="p-8 bg-[#EAE8E4] border border-gray-300 rounded-sm space-y-4">
                    <div className="flex items-center space-x-3 text-[#2C3E50]">
                        <Layers size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest italic text-[#1A1B1E]">Support Policy</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        All parts ship as **Raw Lab Output** with supports intact. This protects delicate features during transit. Premium finishing services for support removal are available on a project-by-project basis.
                    </p>
                </div>
            </div>

            <div className="space-y-12 relative text-[#1A1B1E]">
                {[
                    { id: "01", title: "Configuration", icon: <FileCode className="w-8 h-8" />, desc: "Define your requirements using QuoteLab. Opt for Visual Validation if you require macro photos before shipping.", items: ["Secure Upload", "Validation Check"] },
                    { id: "02", title: "Lab Review", icon: <Eye className="w-8 h-8" />, desc: "Every project at Flour City Labs receives a dedicated review by a technician within 24 hours to validate buildability.", items: ["DFM Audit", "Pricing Quote"] },
                    { id: "03", title: "Production", icon: <Cpu className="w-8 h-8" />, desc: "Your project enters our professional queue, utilizing AMS technology for multi-material fidelity.", items: ["Queue tracking", "QC checks"] },
                    { id: "04", title: "Fulfilment", icon: <Truck className="w-8 h-8" />, desc: "Final inspection precedes protective packaging. We ship nationwide with zero-lead-time handoffs to courier networks.", items: ["Secure Shipping", "Regional Express"] }
                ].map((step, idx) => (
                    <div key={idx} className="bg-[#EAE8E4]/50 border border-gray-300 p-10 rounded-sm grid md:grid-cols-12 gap-8 items-start group hover:shadow-2xl transition-all relative z-10 text-[#1A1B1E]">
                        <span className="md:col-span-1 text-5xl font-black text-[#D4A017]/20 font-mono group-hover:text-[#D4A017] transition-colors">{step.id}</span>
                        <div className="md:col-span-8 flex items-start space-x-6 text-left">
                            <div className="p-3 bg-[#1A1B1E] text-[#D4A017] rounded-sm shrink-0 shadow-lg">{step.icon}</div>
                            <div><h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{step.title}</h3><p className="text-gray-600 font-medium leading-relaxed text-lg">{step.desc}</p></div>
                        </div>
                        <div className="md:col-span-3 border-l border-gray-300 pl-8 hidden md:block space-y-4 text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Milestones</h4>
                            <ul className="space-y-2">{step.details?.map((item, i) => (<li key={i} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><CheckCircle size={10} className="text-[#D4A017]" /><span>{item}</span></li>)) || step.items.map((item, i) => (<li key={i} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><CheckCircle size={10} className="text-[#D4A017]" /><span>{item}</span></li>))}</ul>
                        </div>
                    </div>
                ))}
                <div className="hidden md:block absolute left-[3.5rem] top-24 bottom-24 w-px bg-gray-300 opacity-50 z-0"></div>
            </div>
        </div>
    </div>
);

// eslint-disable-next-line no-unused-vars
const HeritageView = (props) => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-1000 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6 text-left">
            <header className="mb-32 space-y-8">
                <div className="inline-block px-4 py-1 border border-[#D4A017] text-[#D4A017] text-[10px] font-black uppercase tracking-[0.4em]">The Archive</div>
                <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85]">BUILT TO <br /> <span className="text-transparent border-text" style={{ WebkitTextStroke: '2px #1A1B1E' }}>LAST.</span></h2>
                <p className="text-gray-500 max-w-xl font-medium leading-relaxed text-xl italic text-left">"Continuing a two-hundred-year-old conversation about how things are made in the Flour City."</p>
            </header>
            <div className="space-y-40 relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 hidden md:block opacity-30"></div>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left"><div className="space-y-6 text-right order-2 md:order-1"><span className="text-4xl font-black text-[#D4A017] italic">1817</span><h3 className="text-4xl font-black uppercase italic tracking-tighter">The Genesee Force</h3><p className="text-gray-600 font-medium leading-relaxed text-right">Water-powered mills earned Rochester its name. Precision was measured in the turn of the stone.</p></div><div className="flex justify-center order-1 md:order-2"><div className="w-64 h-64 bg-[#2C3E50] flex items-center justify-center rounded-sm shadow-2xl relative"><Waves size={80} className="text-white/10" /><div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#F2F1EF] border border-[#D4A017]/30 flex items-center justify-center shadow-lg"><Anchor size={24} className="text-[#D4A017]" /></div></div></div></div>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left"><div className="flex justify-center"><div className="w-72 h-72 bg-[#1A1B1E] flex items-center justify-center rounded-sm shadow-2xl relative overflow-hidden text-[#1A1B1E]"><OpticsIcon className="w-40 h-40 text-white/20" /><div className="absolute -top-4 -left-4 w-24 h-24 bg-[#F2F1EF] border border-[#D4A017]/30 flex flex-col items-center justify-center shadow-lg"><Compass size={20} className="text-[#D4A017]" /><span className="text-[8px] font-black uppercase text-[#D4A017]">Precision</span></div></div></div><div className="space-y-6 text-left"><span className="text-4xl font-black text-[#D4A017] italic">1945</span><h3 className="text-4xl font-black uppercase italic tracking-tighter">The Technical Hub</h3><p className="text-gray-600 font-medium text-lg leading-relaxed text-left text-[#1A1B1E]">Rochester became the world's center for precision engineering, shifting from river power to the physics of light.</p></div></div>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left"><div className="space-y-6 text-right order-2 md:order-1"><span className="text-4xl font-black text-[#D4A017] italic">2026</span><h3 className="text-4xl font-black uppercase italic tracking-tighter">The Digital Mill</h3><p className="text-gray-600 font-medium leading-relaxed text-[#1A1B1E] text-right">Flour City Labs replaces the milling stone with high-resolution nozzles, building complex realities layer by layer.</p></div><div className="flex justify-center order-1 md:order-2"><div className="relative group"><div className="absolute -inset-4 border border-[#D4A017]/30 translate-x-4 translate-y-4 transition-transform"></div><div className="relative w-64 h-64 bg-[#EAE8E4] border border-gray-300 flex items-center justify-center shadow-xl text-[#1A1B1E]"><LogoIcon className="w-32 h-32" /></div></div></div></div>
            </div>
        </div>
    </div>
);

const ContactView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6">
            <header className="mb-20 space-y-4 text-left text-[#1A1B1E]">
                <span className="text-[#D4A017] font-mono tracking-[0.4em] uppercase text-xs font-black">Region First</span>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-left">The <br /> <span className="text-transparent border-text" style={{ WebkitTextStroke: '1px #1A1B1E' }}>Pipeline.</span></h2>
                <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Operating out of FCL Lab 1 in Rochester's Monroe Ave District. Serving the nationwide additive community with regional dedication.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-12 text-left">
                    <section className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">Direct Connection</h4>
                        <div className="space-y-4 font-bold text-sm uppercase tracking-widest text-[#1A1B1E]">
                            <div className="flex items-center space-x-3 text-[#1A1B1E]"><Mail size={16} className="text-[#D4A017]" /><span>solutions@flourcitylabs.com</span></div>
                            <div className="flex items-center space-x-3 text-[#1A1B1E]"><MapPin size={16} className="text-[#D4A017]" /><span>Monroe Ave District, Rochester NY</span></div>
                        </div>
                    </section>

                    <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-6">
                        <div className="flex items-center space-x-2 text-[#D4A017]"><Truck size={20} /> <h4 className="text-sm font-black uppercase tracking-widest italic text-white">Secure Logistics</h4></div>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed">Every part is secured for cross-country transit. We utilize professional courier networks to ensure Rochester-built precision arrives intact at your door.</p>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">Active Pipeline</span>
                            <CheckCircle size={12} className="text-[#D4A017]" />
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-2 bg-[#EAE8E4] border border-gray-300 p-10 md:p-14 rounded-sm shadow-2xl relative overflow-hidden text-left text-[#1A1B1E]">
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none text-[#1A1B1E]">
                        <LogoIcon className="w-full h-full" />
                    </div>

                    <div className="space-y-8 relative z-10 text-left">
                        <div className="space-y-2">
                            <h4 className="text-3xl font-black uppercase italic tracking-tighter">Lab Inquiry</h4>
                            <p className="text-gray-500 text-sm font-medium">Have questions about technical tolerances or custom Autodesk Fusion support? Ask a technician.</p>
                        </div>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input type="text" placeholder="FULL NAME" className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" />
                                <input type="email" placeholder="EMAIL ADDRESS" className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" />
                            </div>
                            <select className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]">
                                <option>General Engineering Question</option>
                                <option>Specialized Prototyping Query</option>
                                <option>Business/B2B Partnership</option>
                                <option>Custom Engineering Validation</option>
                            </select>
                            <textarea placeholder="HOW CAN THE LAB ASSIST?" className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017] h-40"></textarea>
                            <button className="w-full py-5 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all flex items-center justify-center space-x-3">
                                <span>Send Message</span> <MessageSquare size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TOSView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-4xl mx-auto px-6 text-left">
            <header className="mb-16 space-y-4">
                <Scale className="text-[#D4A017] w-12 h-12 mb-4" />
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Terms of Service</h2>
                <p className="text-gray-500 font-medium">FCL Lab Standards & Service Level Agreement (SLA)</p>
            </header>

            <div className="space-y-12 pb-20 text-[#1A1B1E]">
                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">1. Project Minimums & Pricing</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">To maintain our standard of manual quality assurance and technician review, Flour City Labs observes a **$25.00 minimum project threshold**. This fee covers initial design review, machine calibration, and material setup. All quotes are valid for 14 days.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">2. The Technician's Shield (Liability)</h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-[#1A1B1E]">Structural integrity and dimensional accuracy of the CAD geometry remain the sole responsibility of the client. While FCL performs a "Printability Review," we do not guarantee functional performance of client designs. Projects that fail during production due to geometry constraints are subject to a **$25.00 Lab Reset Fee**.</p>
                </section>

                <section className="space-y-4 text-[#1A1B1E]">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">3. Raw Lab Output Policy</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">By default, all parts are delivered as **Raw Lab Output**. Support structures remain intact to provide maximum structural rigidity during transit. FCL provides premium finishing only as an explicitly quoted add-on service.</p>
                </section>

                <section className="space-y-4 text-[#1A1B1E]">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">4. Shipping & Logistics</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">FCL Lab 1 operates as a secure private production facility. Physical site visits are by appointment only. We ensure industrial-grade packaging, however the lab is not liable for third-party courier delays.</p>
                </section>
            </div>
        </div>
    </div>
);

const PrivacyView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-4xl mx-auto px-6 text-left text-[#1A1B1E]">
            <header className="mb-16 space-y-4">
                <Lock className="text-[#D4A017] w-12 h-12 mb-4" />
                <h2 className="text-5xl font-black uppercase tracking-tighter italic">Privacy Policy</h2>
                <p className="text-gray-500 font-medium">Data Integrity & Intellectual Property Protocol</p>
            </header>

            <div className="space-y-12 pb-20">
                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">1. CAD Data Integrity</h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-[#1A1B1E]">We treat your CAD data as proprietary intellectual property. 3D models uploaded are used exclusively for quoting and production. We do not share, sell, or utilize your designs for any purposes other than fulfillment. Files are purged from active servers 30 days post-production.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">2. Personal Information</h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-[#1A1B1E]">We collect basic contact information to facilitate the quoting pipeline. This data is stored securely and never sold to third-party marketing entities. By using the QuoteLab, you consent to Receive technical communications regarding your project.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">3. Local Privacy</h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-[#1A1B1E]">FCL Lab 1 is a private workstation. For the security of our technicians and client projects, our exact physical coordinates are disclosed only during active logistics handoffs.</p>
                </section>
            </div>
        </div>
    </div>
);

// --- APP ENTRY POINT ---

const App = () => {
    const [view, setView] = useState('home');
    const [isScrolled, setIsScrolled] = useState(false);
    const [quoteStep, setQuoteStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [formData, setFormData] = useState({
        name: '', email: '', selectedMaterial: 'PLA - Matte', intent: '',
        colorCount: 1, selectedColors: ['', '', '', ''],
        nozzle: '0.4mm (Std)', infill: '15% (Std)', walls: '2 Walls (Std)',
        speed: 'Balanced', resolution: '0.20mm (Std)', supports: 'Auto (Tech)',
        visualValidation: false, fileName: '', fileContent: ''
    });

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#F2F1EF] font-sans selection:bg-[#D4A017] selection:text-[#1A1B1E] overflow-x-hidden text-[#1A1B1E]">
            <Navigation view={view} setView={setView} isScrolled={isScrolled} isHome={view === 'home'} />
            {view === 'home' && (
                <HomeView
                    quoteStep={quoteStep} setQuoteStep={setQuoteStep}
                    isUploading={isUploading} setIsUploading={setIsUploading}
                    showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
                    formData={formData} setFormData={setFormData}
                    colorDatabase={colorDatabase} setView={setView}
                />
            )}
            {view === 'materials' && <MaterialsView />}
            {view === 'gallery' && <GalleryView />}
            {view === 'process' && <ProcessView />}
            {view === 'heritage' && <HeritageView LogoIcon={LogoIcon} setView={setView} />}
            {view === 'contact' && <ContactView />}
            {view === 'tos' && <TOSView />}
            {view === 'privacy' && <PrivacyView />}
            <Footer setView={setView} />
            <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.15); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; transform-origin: center; }
        .border-text { -webkit-text-fill-color: transparent; }
        ::selection { background: #D4A017; color: #1A1B1E; }
      `}</style>
        </div>
    );
};

export default App;