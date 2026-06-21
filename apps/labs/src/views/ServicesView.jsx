import React from 'react';
import { Mail, Cpu, Globe } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';

const ServicesView = ({ setView }) => (
    <div className="animate-in fade-in duration-700">
        {/* Header Section */}
        <section className="relative pt-40 pb-24 overflow-hidden bg-[#1A1B1E] text-[#F2F1EF]">
            <div className="absolute inset-0 z-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute border-t border-slate-500 w-full" style={{ top: `${i * 5}%`, transform: `skewY(-2deg)` }}></div>
                ))}
            </div>
            <div className="relative z-20 max-w-7xl mx-auto px-6">
                <header className="space-y-12 text-left">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">What We Do</span>
                    <DimensionedHeader line1="WHAT I DO." line2="FOR YOU." layerHt="Rochester·NY" partWd="Est·2026" variant="dark" showUnits={false} />
                    <p className="text-gray-400 max-w-2xl font-medium leading-relaxed text-lg text-left">Web consulting, email deliverability, and 3D printing — from one person who cares about the details.</p>
                </header>
            </div>
        </section>

        {/* Content Section */}
        <section className="py-24 bg-[#F2F1EF] text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">

            {/* Service cards */}
            <section className="grid md:grid-cols-3 gap-8 mb-24">
                {/* Email Deliverability */}
                <div onClick={() => setView('email')} className="bg-gradient-to-br from-[#2C3E50] to-[#1A1B1E] p-8 rounded-sm border border-white/10 text-[#F2F1EF] space-y-4 hover:shadow-xl transition-all cursor-pointer">
                    <Mail size={28} className="text-[#D4A017]" />
                    <h3 className="font-display text-xl font-black uppercase italic tracking-tighter text-white">Email Deliverability</h3>
                    <p className="text-sm font-medium leading-relaxed text-gray-300">Your customers can't pay invoices they never received. I check your SPF, DKIM, DMARC, and MX records, find what's sending your mail to spam, and fix it. First checkup is free.</p>
                    <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-[#D4A017]">
                        Check your email →
                    </div>
                </div>

                {/* 3D Printing */}
                <div onClick={() => setView('printing')} className="bg-gradient-to-br from-[#2C3E50] to-[#1A1B1E] p-8 rounded-sm border border-white/10 text-[#F2F1EF] space-y-4 hover:shadow-xl transition-all cursor-pointer">
                    <Cpu size={28} className="text-[#D4A017]" />
                    <h3 className="font-display text-xl font-black uppercase italic tracking-tighter text-white">3D Printing</h3>
                    <p className="text-sm font-medium leading-relaxed text-gray-300">Small-run parts, prototypes, and one-offs on a Bambu Lab P1S. Upload a file in the QuoteLab and I'll quote it within 24 hours.</p>
                    <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-[#D4A017]">
                        Open the QuoteLab →
                    </div>
                </div>

                {/* Web & Site Work */}
                <div onClick={() => setView('web-design')} className="bg-gradient-to-br from-[#2C3E50] to-[#1A1B1E] p-8 rounded-sm border border-white/10 text-[#F2F1EF] space-y-4 hover:shadow-xl transition-all cursor-pointer">
                    <Globe size={28} className="text-[#D4A017]" />
                    <h3 className="font-display text-xl font-black uppercase italic tracking-tighter text-white">Web & Site Work</h3>
                    <p className="text-sm font-medium leading-relaxed text-gray-300">DNS fixes, hosting, site updates, chatbot integrations, Google Reviews setup — if it touches the web, I can probably help. Scope varies, so let's talk about yours.</p>
                    <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-[#D4A017]">
                        Let's talk →
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="text-center">
                <hr className="border-gray-300 mb-12" />
                <p className="text-gray-500 font-medium text-lg mb-6">Not sure where to start?</p>
                <button
                    onClick={() => setView('contact')}
                    className="px-10 py-4 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all"
                >
                    Get in touch
                </button>
            </section>

        </div>
        </section>
    </div>
);

export default ServicesView;
