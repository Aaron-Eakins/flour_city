import React, { useState, useEffect } from 'react';
import { Mail, MapPin, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { SITE_CONFIG } from '../constants/site';
import { useAuth } from '../context/AuthContext';

import DimensionedHeader from '../components/common/DimensionedHeader';
import LogoIcon from '../components/common/LogoIcon';
import { supabase } from '../lib/supabaseClient';
import { useTurnstile } from '../hooks/useTurnstile';

const ContactView = ({ setView }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: '3D printing',
        subject: '',
        message: '',
        _honeypot: ''
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name || prev.name,
            }));
        }
    }, [user]);
    
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const { token: turnstileToken, reset: resetTurnstile, containerRef: turnstileRef } = useTurnstile();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 1. Bot check
        if (!turnstileToken) {
            setErrorMessage('Security verification required');
            setStatus('error');
            return;
        }

        // 2. Honeypot check: If the hidden field is filled, it's a bot
        if (formData._honeypot) {
            console.warn('Spam detected via honeypot.');
            setStatus('success'); // Pretend success to bot
            return;
        }

        setStatus('loading');
        
        try {
            const composedMessage = `[${formData.category}] ${formData.subject}\n\n${formData.message}`;

            const { data: contact, error } = await supabase
                .from('contacts')
                .insert({
                    name: formData.name,
                    email: formData.email,
                    message: composedMessage,
                })
                .select()
                .single();

            if (error) throw error;
            
            // 3. Explicitly trigger notification Edge Function
            const { error: funcError } = await supabase.functions.invoke('send-notification', {
                body: {
                    record: contact,
                    table: 'contacts',
                    type: 'INSERT',
                    turnstile_token: turnstileToken
                }
            });

            if (funcError) throw new Error(`Notification failed: ${funcError.message}`);

            setStatus('success');
            setFormData({ name: '', email: '', category: '3D printing', subject: '', message: '', _honeypot: '' });
            resetTurnstile(); // Clear token for next time
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
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Rochester, NY</span>
                    <DimensionedHeader line1="LET'S" line2="TALK." layerHt="SPF·DKIM" partWd="DMARC·MX" variant="light" />
                    <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Based in Rochester, NY. Taking work nationwide.</p>
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1 space-y-12 text-left">
                        <section className="space-y-6 text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">Get in touch</h4>
                            <div className="space-y-4 font-bold text-sm uppercase tracking-widest text-[#1A1B1E] text-left">
                                <div className="flex items-center space-x-3 text-[#1A1B1E]"><Mail size={16} className="text-[#D4A017]" /><a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-[#D4A017] transition-colors">{SITE_CONFIG.email}</a></div>
                                <div className="flex items-center space-x-3 text-[#1A1B1E]"><MapPin size={16} className="text-[#D4A017]" /><span>{SITE_CONFIG.region}</span></div>
                            </div>
                        </section>

                        <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-4 text-left">
                            <h4 className="text-sm font-black uppercase tracking-widest italic text-white">Free email checkup</h4>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed text-left">Send me your domain and I'll check SPF, DKIM, DMARC, MX, and blacklist status, then email you what's broken and how to fix it. No charge for the first look.</p>
                            <button onClick={() => setView('email-checkup')} className="text-[9px] font-black uppercase tracking-widest text-[#D4A017] hover:text-white transition-colors">
                                Start a checkup →
                            </button>
                        </section>
                    </div>

                    <div className="lg:col-span-2 bg-[#EAE8E4] border border-gray-300 p-10 md:p-14 rounded-sm shadow-2xl relative overflow-hidden text-left text-[#1A1B1E]">
                        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none text-[#1A1B1E]">
                            <LogoIcon className="w-full h-full" />
                        </div>

                        <div className="space-y-8 relative z-10 text-left">
                            <div className="space-y-2">
                                <h4 className="font-display text-3xl font-black uppercase italic tracking-tighter">Send a message</h4>
                                <p className="text-gray-500 text-sm font-medium">Question about a print, an email problem, or something else? Tell me what's going on and I'll get back to you.</p>
                            </div>

                            {status === 'success' ? (
                                <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                                        <CheckCircle size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-display text-xl font-black uppercase tracking-tighter">Got it.</p>
                                        <p className="text-sm text-gray-500 italic">I'll get back to you within 24 hours.</p>
                                    </div>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017] hover:underline"
                                    >
                                        Send another message
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
                                            placeholder="Full name"
                                            required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email address"
                                            required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4 text-left">
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all appearance-none pr-10"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            >
                                                <option value="3D printing">3D printing</option>
                                                <option value="Email/web help">Email/web help</option>
                                                <option value="Something else">Something else</option>
                                            </select>
                                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▾</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            required
                                            className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        />
                                    </div>
                                    <textarea
                                        placeholder="What can I help you with?"
                                        required
                                        className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all h-40"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                    
                                    {status === 'error' && (
                                        <div className="flex items-center space-x-2 text-red-600 text-xs font-bold uppercase tracking-tighter">
                                            <AlertCircle size={14} />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    {/* Turnstile Container */}
                                    <div className="flex justify-start py-2">
                                        <div ref={turnstileRef}></div>
                                    </div>

                                    <button 
                                        disabled={status === 'loading' || !turnstileToken}
                                        className="w-full py-5 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                                    >
                                        <span>{status === 'loading' ? 'Sending...' : 'Send message'}</span>
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

