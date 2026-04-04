import React from 'react';
import { Upload, Settings, ChevronDown, ChevronUp, Palette, Minus, Plus, ArrowRight, Globe, CheckCircle, FileText, Camera } from 'lucide-react';
import { colorDatabase } from '../../constants/materials';

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
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 text-center">
                        <div className="space-y-2">
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter">1. Project Entry</h3>
                            <p className="text-gray-500 font-medium text-sm italic tracking-tight">Secure STL, 3MF, or OBJ upload. (Max 50MB)</p>
                        </div>
                        <label className="group border-2 border-dashed border-gray-300 rounded-sm p-20 flex flex-col items-center justify-center text-center space-y-6 hover:border-[#D4A017] hover:bg-[#2C3E50]/10 transition-all cursor-pointer bg-[#2C3E50]/5 relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                            {isUploading ? (
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-12 h-12 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] font-black text-[#D4A017]">Securing Connection...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 rounded-full bg-[#1A1B1E] flex items-center justify-center group-hover:bg-[#D4A017] transition-all shadow-lg">
                                        <Upload className="w-8 h-8 text-white group-hover:text-[#1A1B1E]" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black uppercase tracking-tighter">Select CAD Geometry</p>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] opacity-60">Manual Technical Review Active</p>
                                    </div>
                                </>
                            )}
                        </label>
                    </div>
                )}

                {quoteStep === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter text-center">2. Logic Configuration</h3>
                            <p className="text-gray-500 font-medium text-sm italic tracking-tight text-center">Active Project: {formData.fileName}</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block">Filament Selection</label>
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
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 block">Project Intent</label>
                                    <textarea
                                        value={formData.intent}
                                        onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                                        placeholder="Describe the part's function or tolerance needs..."
                                        className="w-full bg-[#2C3E50]/5 border border-gray-300 p-4 rounded-sm font-medium text-sm outline-none focus:border-[#D4A017] h-32"
                                    ></textarea>
                                </div>
                                <label className="flex items-start space-x-4 p-4 border border-gray-300 bg-white/50 rounded-sm cursor-pointer group hover:border-[#D4A017] transition-colors">
                                    <input type="checkbox" className="mt-1 accent-[#D4A017] w-4 h-4" checked={formData.visualValidation} onChange={(e) => setFormData({ ...formData, visualValidation: e.target.checked })} />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-2"><Camera size={12} className="text-[#D4A017]" /><span>Request Visual Validation</span></p>
                                        <p className="text-[9px] text-gray-500 leading-tight">Receive macro photos of finished parts via email before shipping.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="pt-4 flex flex-col md:flex-row justify-between items-center gap-6">
                            <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#2C3E50] hover:text-[#D4A017] transition-colors"><Settings size={14} /><span>Advanced Engineering Params</span>{showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                            <button onClick={() => setQuoteStep(3)} className="w-full md:w-auto px-10 py-4 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center space-x-4 hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all shadow-xl uppercase">Lock Parameters <ArrowRight size={14} /></button>
                        </div>
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
                                <div className="flex items-center space-x-3 text-[#D4A017]"><Globe size={18} /><p className="text-[10px] font-black uppercase tracking-[0.15em]">Lab-to-Door Fulfillment</p></div>
                                <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-relaxed">Secure nationwide shipping from FCL Lab 1. One-day regional transit for Rochester-based orders.</p>
                            </div>
                            <button onClick={() => setQuoteStep(4)} className="w-full py-6 bg-[#D4A017] text-[#1A1B1E] font-black uppercase text-sm tracking-[0.4em] hover:bg-[#1A1B1E] hover:text-white transition-all shadow-2xl mt-4 uppercase font-black">Transmit to Lab</button>
                        </div>
                    </div>
                )}

                {quoteStep === 4 && (
                    <div className="py-16 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                        <CheckCircle className="w-24 h-24 text-green-700 mx-auto" />
                        <div className="space-y-4 text-[#1A1B1E]">
                            <h3 className="text-5xl font-black uppercase tracking-tighter">IN THE LAB.</h3>
                            <div className="w-16 h-1 bg-[#D4A017] mx-auto"></div>
                            <p className="text-gray-600 max-w-sm mx-auto font-medium leading-relaxed italic opacity-90 text-center">Project secured. A lab technician will personally review your design and email a professional quote within 24 hours.</p>
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

export default QuoteLab;
