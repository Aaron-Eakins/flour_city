import React, { useState } from 'react';
import { Mail, MapPin, Truck, CheckCircle, MessageSquare, AlertCircle, Send } from 'lucide-react';
import { SITE_CONFIG } from '../constants/site';

import DimensionedHeader from '../components/common/DimensionedHeader';
import LogoIcon from '../components/common/LogoIcon';
import { supabase } from '../lib/supabaseClient';

const ContactView = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        _honeypot: '' // Spam prevention
    });
    
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Honeypot check: If the hidden field is filled, it's a bot
        if (formData._honeypot) {
            console.warn('Spam detected via honeypot.');
            setStatus('success'); // Pretend success to bot
            return;
        }

        setStatus('loading');
        
        try {
            const { error } = await supabase
                .from('contacts')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                });

            if (error) throw error;
            
            setStatus('success');
            setFormData({ name: '', email: '', message: '', _honeypot: '' });
        } catch (err) {
            console.error('Contact error:', err.message);
            setErrorMessage(`Something went wrong. Please try again or email me directly at ${SITE_CONFIG.email}.`);
            setStatus('error');
        }
    };

    return (
        <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-20 space-y-12 text-left text-[#1A1B1E]">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Region First</span>
                    <DimensionedHeader line1="THE" line2="PIPELINE." layerHt="0.20mm" partWd="210mm" variant="light" />
                    <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Based in Rochester, NY. Taking orders nationwide.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-12 text-left">
                        <section className="space-y-6 text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">Direct Connection</h4>
                            <div className="space-y-4 font-bold text-sm uppercase tracking-widest text-[#1A1B1E] text-left">
                                <div className="flex items-center space-x-3 text-[#1A1B1E]"><Mail size={16} className="text-[#D4A017]" /><span>{SITE_CONFIG.email}</span></div>
                                <div className="flex items-center space-x-3 text-[#1A1B1E]"><MapPin size={16} className="text-[#D4A017]" /><span>{SITE_CONFIG.district}, {SITE_CONFIG.region}</span></div>
                            </div>
                        </section>

                        <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-6 text-left">
                            <div className="flex items-center space-x-2 text-[#D4A017]"><Truck size={20} /> <h4 className="text-sm font-black uppercase tracking-widest italic text-white">Secure Logistics</h4></div>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed text-left">Every order is carefully packaged for transit. We ship nationwide through standard courier networks.</p>
                            <div className="p-3 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">Orders Open</span>
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
                                <p className="text-gray-500 text-sm font-medium">Questions about an order, a material, or a custom project? Send me a message.</p>
                            </div>

                            {status === 'success' ? (
                                <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                                        <CheckCircle size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-black uppercase tracking-tighter">Inquiry Secured</p>
                                        <p className="text-sm text-gray-500 italic">I'll get back to you within 24 hours.</p>
                                    </div>
                                    <button 
                                        onClick={() => setStatus('idle')}
                                        className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017] hover:underline"
                                    >
                                        Send Another Inquiry
                                    </button>
                                </div>
                            ) : (
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    {/* Honeypot field (hidden from humans) */}
                                    <input 
                                        type="text" 
                                        name="_honeypot" 
                                        style={{ display: 'none' }} 
                                        tabIndex="-1" 
                                        autoComplete="off"
                                        value={formData._honeypot}
                                        onChange={(e) => setFormData({ ...formData, _honeypot: e.target.value })}
                                    />

                                    <div className="grid md:grid-cols-2 gap-4 text-left">
                                        <input 
                                            type="text" 
                                            placeholder="FULL NAME" 
                                            required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <input 
                                            type="email" 
                                            placeholder="EMAIL ADDRESS" 
                                            required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <textarea 
                                        placeholder="WHAT CAN I HELP YOU WITH?" 
                                        required
                                        className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017] h-40"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                    
                                    {status === 'error' && (
                                        <div className="flex items-center space-x-2 text-red-600 text-xs font-bold uppercase tracking-tighter">
                                            <AlertCircle size={14} />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    <button 
                                        disabled={status === 'loading'}
                                        className="w-full py-5 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                                    >
                                        <span>{status === 'loading' ? 'Sending...' : 'Send Message'}</span>
                                        {status !== 'loading' && <Send size={14} />}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactView;

