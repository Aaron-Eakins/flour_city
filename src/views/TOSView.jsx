import React from 'react';
import { Scale } from 'lucide-react';

const TOSView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-4xl mx-auto px-6 text-left">
            <header className="mb-16 space-y-4 text-left">
                <Scale className="text-[#D4A017] w-12 h-12 mb-4" />
                <h2 className="text-5xl font-black uppercase tracking-tighter italic text-[#1A1B1E]">Terms of Service</h2>
                <p className="text-gray-500 font-medium uppercase font-mono text-xs tracking-widest opacity-50">Standard Lab Protocol</p>
            </header>
            <div className="space-y-12 pb-20 text-[#1A1B1E] text-left">
                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">1. Project Minimums</h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-[#1A1B1E]">To maintain technician review standards, Flour City Labs observes a **$25.00 minimum project threshold** per order.</p>
                </section>
                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">2. The Technician's Shield</h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-[#1A1B1E]">CAD structural integrity is the client's responsibility. Fails due to geometry are subject to a **$25.00 Lab Reset Fee**.</p>
                </section>
            </div>
        </div>
    </div>
);

export default TOSView;
