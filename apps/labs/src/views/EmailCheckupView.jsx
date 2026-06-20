import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Send, Mail } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import { SITE_CONFIG } from '../constants/site';
import { supabase } from '../lib/supabaseClient';
import { useTurnstile } from '../hooks/useTurnstile';

const EmailCheckupView = ({ setView }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        domain: '',
        notes: '',
        _honeypot: '',
    });
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const { execute: executeTurnstile, reset: resetTurnstile, containerRef: turnstileRef } = useTurnstile();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData._honeypot) {
            setStatus('success');
            return;
        }

        setStatus('loading');

        // Run the Turnstile challenge on click, then require a token.
        const turnstileToken = await executeTurnstile();
        if (!turnstileToken) {
            setErrorMessage('Security verification failed. Please try again.');
            setStatus('error');
            return;
        }

        try {
            const message = `[Email Checkup Request]\nDomain: ${formData.domain}${formData.notes ? `\n\n${formData.notes}` : ''}`;

            const { data: contact, error } = await supabase
                .from('contacts')
                .insert({ name: formData.name, email: formData.email, message })
                .select()
                .single();

            if (error) throw error;

            const { error: funcError } = await supabase.functions.invoke('send-notification', {
                body: { record: contact, table: 'contacts', type: 'INSERT', turnstile_token: turnstileToken },
            });

            if (funcError) throw new Error(`Notification failed: ${funcError.message}`);

            setStatus('success');
            setFormData({ name: '', email: '', domain: '', notes: '', _honeypot: '' });
            resetTurnstile();
        } catch (err) {
            console.error('Checkup submission error:', err.message);
            setErrorMessage(`Something went wrong. Try again or email me at ${SITE_CONFIG.email}.`);
            setStatus('error');
        }
    };

    return (
        <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">

                <header className="mb-20 space-y-12 text-left">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Email Deliverability</span>
                    <DimensionedHeader line1="FREE EMAIL" line2="CHECKUP." layerHt="SPF·DKIM" partWd="DMARC·MX" variant="light" showUnits={false} />
                    <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">
                        Enter your domain and I'll check the things that quietly send your email to spam: SPF, DKIM, DMARC, MX records, and whether you're on any blacklists. I'll email you what's broken and how to fix it. The first look is free. If you want me to fix the issues, we can discuss the scope and cost.
                    </p>
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-10 text-left">
                        <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-4">
                            <div className="flex items-center gap-3 text-[#D4A017]">
                                <Mail size={18} />
                                <h4 className="text-sm font-black uppercase tracking-widest italic text-white">What I check</h4>
                            </div>
                            <ul className="space-y-2 text-xs font-medium text-slate-400 leading-relaxed">
                                {['SPF record validity', 'DKIM key configuration', 'DMARC policy and alignment', 'MX record health', 'Blacklist status'].map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <CheckCircle size={11} className="text-[#D4A017] shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="pt-2 border-t border-white/10">
                                <p className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">First checkup free</p>
                            </div>
                        </section>

                        <section className="space-y-3 text-left">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">Or try the self-serve tool</p>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">Have a saved .eml or .msg file? Run it through the Email Analyzer for an instant header breakdown.</p>
                            <button onClick={() => setView('audit')} className="text-[10px] font-black uppercase tracking-widest text-[#1A1B1E] hover:text-[#D4A017] transition-colors">
                                Open Email Analyzer →
                            </button>
                        </section>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2 bg-[#EAE8E4] border border-gray-300 p-10 md:p-14 rounded-sm shadow-2xl">
                        {status === 'success' ? (
                            <div className="py-12 text-center space-y-6 animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                                    <CheckCircle size={40} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-display font-black uppercase tracking-tighter">Got it.</p>
                                    <p className="text-sm text-gray-500 italic">I'll run the checks and email you within 24 hours.</p>
                                </div>
                                <button onClick={() => setStatus('idle')} className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017] hover:underline">
                                    Submit another request
                                </button>
                            </div>
                        ) : (
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-2 mb-8">
                                    <h3 className="font-display text-3xl font-black uppercase italic tracking-tighter">Request your checkup</h3>
                                    <p className="text-gray-500 text-sm font-medium">I just need your domain. Everything else is optional.</p>
                                </div>

                                {/* Honeypot */}
                                <input type="text" name="_honeypot" style={{ display: 'none' }} tabIndex="-1" autoComplete="off"
                                    value={formData._honeypot} onChange={(e) => setFormData({ ...formData, _honeypot: e.target.value })} />

                                <div className="grid md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Full name" required
                                        className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    <input type="email" placeholder="Email address" required
                                        className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>

                                <input type="text" placeholder="Your domain (e.g. yourbusiness.com)" required
                                    className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all font-mono"
                                    value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} />

                                <textarea placeholder="Anything else I should know? (optional)"
                                    className="w-full p-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all h-28 resize-none"
                                    value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />

                                {status === 'error' && (
                                    <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-tighter">
                                        <AlertCircle size={14} />
                                        <span>{errorMessage}</span>
                                    </div>
                                )}

                                <div className="flex justify-start py-2">
                                    <div ref={turnstileRef}></div>
                                </div>

                                <button type="submit" disabled={status === 'loading'}
                                    className="w-full py-5 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                    <span>{status === 'loading' ? 'Sending...' : 'Request checkup'}</span>
                                    {status !== 'loading' && <Send size={14} />}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailCheckupView;
