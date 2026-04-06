import React from 'react';
import { Wrench, Beaker } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';

const MaterialsView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto px-6 text-[#1A1B1E] text-left">
            <header className="mb-20 space-y-8">
                <div className="inline-block px-4 py-1 border border-[#D4A017] text-[#D4A017] text-[10px] font-black uppercase tracking-[0.4em]">Stocked for Quality</div>
                <DimensionedHeader line1="MATERIAL" line2="LIBRARY." layerHt="0.12mm" partWd="142.8mm" variant="light" />
                <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg">Curated high-performance polymers, optimized for our specialized hotends.</p>
            </header>
            <div className="grid md:grid-cols-2 gap-12 text-left">
                <div className="p-10 bg-[#2C3E50] text-[#F2F1EF] rounded-sm shadow-2xl relative overflow-hidden group">
                    <Beaker className="absolute -top-4 -right-4 w-40 h-40 text-white/5 opacity-20" />
                    <div className="relative z-10 space-y-8">
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

export default MaterialsView;

