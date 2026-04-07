import React from 'react';
import { Box, ChevronRight } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import LogoIcon from '../components/common/LogoIcon';
import QuoteLab from '../components/quote/QuoteLab';

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
                        <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Rochester Built. Layered with Purpose.</span>
                        <DimensionedHeader
                            line1="LOCAL SCALE."
                            line2="MODERN CRAFT."
                            layerHt="0.10mm"
                            partWd="256mm"
                            variant="dark"
                        />
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
                                <div className="text-right text-[#F2F1EF]">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none">Lab Status</div>
                                    <div className="text-xl font-black tracking-tighter uppercase italic mt-1">Ready to Print</div>
                                </div>
                            </div>
                            <div className="space-y-2 text-[#F2F1EF]">
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
                <header className="mb-12 space-y-2 text-center">
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">The QuoteLab</h2>
                    <p className="text-gray-500 text-sm font-medium italic">Boutique pricing with professional technical data capture.</p>
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
                    <h3 className="text-5xl font-black tracking-tighter leading-none uppercase text-white text-left">MAKING IS IN <br /><span className="text-[#D4A017]">OUR BLOOD.</span></h3>
                    <p className="text-gray-300 text-lg font-medium italic leading-relaxed text-left">"Continuing a two-hundred-year-old conversation about how things are made in the Flour City."</p>
                    <button onClick={() => props.setView('heritage')} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#D4A017] hover:text-white transition-colors">
                        <span>Read the Archive</span><ChevronRight size={14} className="ml-1" />
                    </button>
                </div>
            </div>
        </section>
    </div>
);

export default HomeView;

