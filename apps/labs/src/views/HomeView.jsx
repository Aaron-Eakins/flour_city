import React from 'react';
import { Mail, ChevronRight, ArrowRight } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import LogoIcon from '../components/common/LogoIcon';

const HomeView = (props) => (
    <div className="animate-in fade-in duration-1000">
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#1A1B1E]">
            <div className="absolute inset-0 z-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute border-t border-slate-500 w-full" style={{ top: `${i * 5}%`, transform: `skewY(-2deg)` }}></div>
                ))}
            </div>
            <div className="relative z-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center text-left">
                <div className="relative z-50 space-y-8">
                    <div className="space-y-2">
                        <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Rochester, NY · Web & Email Consulting</span>
                        <DimensionedHeader
                            line1="WEB & EMAIL"
                            line2="CONSULTING."
                            layerHt="SPF·DKIM"
                            partWd="DMARC·MX"
                            variant="dark"
                            showUnits={false}
                        />
                    </div>
                    <p className="text-gray-400 text-lg max-w-md leading-relaxed border-l-2 border-[#D4A017] pl-6 font-medium">Is your email landing in spam? Are your DNS records a mess? Most small businesses don't know what they're losing until a customer says they never got the invoice. I find what's broken and fix it.</p>
                    <button onClick={() => props.setView('email-checkup')} className="px-10 py-5 bg-[#D4A017] text-[#1A1B1E] font-black rounded-sm flex items-center space-x-3 hover:scale-105 transition-transform uppercase tracking-widest text-sm shadow-xl">
                        <span>Get a Free Email Checkup</span><ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative hidden md:block">
                    <div className="relative w-full aspect-square flex items-center justify-center">
                        <div className="absolute w-96 h-96 border border-[#D4A017]/20 rounded-full animate-spin-slow"></div>
                        <div className="relative z-10 w-80 h-80 bg-gradient-to-br from-[#2C3E50] to-[#1A1B1E] rounded-2xl shadow-2xl border border-white/10 p-8 flex flex-col justify-between overflow-hidden text-[#F2F1EF]">
                            <div className="flex justify-between items-start">
                                <Mail className="w-12 h-12 text-[#D4A017]" />
                                <div className="text-right text-[#F2F1EF]">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">Audit Status</div>
                                    <div className="text-xl font-display font-black tracking-tighter uppercase italic mt-1">In Progress</div>
                                </div>
                            </div>
                            <div className="space-y-4 text-[#F2F1EF]">
                                <div className="space-y-1">
                                    {['SPF', 'DKIM', 'DMARC', 'Blacklist'].map((check) => (
                                        <div key={check} className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
                                            <span className="text-gray-500">{check}</span>
                                            <span className="text-[#D4A017]">Checking...</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest border-t border-white/10 pt-2">
                                    <span>Response</span><span>Est. 24h</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 3D Printing — secondary teaser only */}
        <section className="py-20 bg-[#F2F1EF] border-b border-gray-200 text-[#1A1B1E]">
            <div className="max-w-5xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block border-l-2 border-[#D4A017] pl-4">Also in the workshop</span>
                        <h2 className="font-display text-4xl font-black uppercase italic tracking-tighter">3D Printing</h2>
                        <p className="text-gray-500 text-base font-medium max-w-md">Need a part printed? Upload your file in the QuoteLab and I'll send a quote within 24 hours.</p>
                    </div>
                    <button onClick={() => props.setView('printing')} className="shrink-0 px-8 py-4 border-2 border-[#1A1B1E] text-[#1A1B1E] font-black text-xs uppercase tracking-widest hover:bg-[#1A1B1E] hover:text-white transition-all flex items-center gap-3 rounded-sm">
                        Open the QuoteLab <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </section>

        <section className="bg-[#2C3E50] py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center text-[#F2F1EF]">
                <div className="relative group text-center flex justify-center">
                    <div className="absolute -inset-4 border border-[#D4A017]/30 translate-x-8 translate-y-8 transition-transform"></div>
                    <div className="relative aspect-square w-full max-w-[500px] bg-[#1A1B1E] overflow-hidden shadow-2xl flex items-center justify-center">
                        <LogoIcon className="w-64 h-64 opacity-10" />
                        <div className="absolute bottom-10 left-10 z-20 text-left">
                            <h4 className="font-display text-white text-3xl font-black italic tracking-tighter uppercase leading-none">Rochester DNA</h4>
                            <p className="text-[#D4A017] font-mono text-xs tracking-[0.4em] font-bold uppercase">Built to Last</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-8 text-left">
                    <div className="inline-block px-4 py-1 border border-[#D4A017] text-[#D4A017] text-[10px] font-black tracking-[0.4em] uppercase">Why "Flour City"</div>
                    <h3 className="font-display text-5xl font-black tracking-tighter leading-none uppercase text-white text-left">MAKING IS IN <br /><span className="text-[#D4A017]">OUR BLOOD.</span></h3>
                    <p className="text-gray-300 text-lg font-medium italic leading-relaxed text-left">"Continuing Rochester's tradition of making things that work."</p>
                    <button onClick={() => props.setView('about')} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A017] hover:text-white transition-colors">
                        <span>Read the story</span><ChevronRight size={14} className="ml-1" />
                    </button>
                </div>
            </div>
        </section>
    </div>
);

export default HomeView;

