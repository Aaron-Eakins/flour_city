import React from 'react';
import { Wrench, Beaker } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';

const MaterialsView = ({ setView }) => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto px-6 text-[#1A1B1E] text-left">
            <header className="mb-20 space-y-12 text-left">
                <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">What's in the Workshop</span>
                <DimensionedHeader line1="MATERIAL" line2="LIBRARY." layerHt="0.12mm" partWd="256mm" variant="light" />
                <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg">The materials I keep stocked for most orders. More available on request.</p>
            </header>
            <div className="grid md:grid-cols-2 gap-12 text-left">
                <div className="p-10 bg-[#2C3E50] text-[#F2F1EF] rounded-sm shadow-2xl relative overflow-hidden group">
                    <Beaker className="absolute -top-4 -right-4 w-40 h-40 text-white/5 opacity-20" />
                    <div className="relative z-10 space-y-8">
                        <div className="inline-block px-3 py-1 bg-[#D4A017] text-[#1A1B1E] text-[10px] font-black uppercase tracking-widest">Aesthetic Focus</div>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">PLA Series</h3>
                        <p className="text-slate-400 font-medium leading-relaxed">The go-to material for detailed visual models, prototypes, and anything where appearance matters more than strength.</p>
                        <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-8 font-bold text-xs uppercase tracking-widest">
                            <div className="space-y-1"><p className="text-[#D4A017]">Variates</p><p>Matte, Silk, Standard</p></div>
                            <div className="space-y-1"><p className="text-[#D4A017]">Stability</p><p>Up to 55°C</p></div>
                        </div>
                    </div>
                </div>
                <div className="p-10 bg-[#EAE8E4] border border-gray-300 rounded-sm shadow-2xl relative overflow-hidden group text-[#1A1B1E]">
                    <Wrench className="absolute -top-4 -right-4 w-40 h-40 text-[#1A1B1E]/5 opacity-20" />
                    <div className="relative z-10 space-y-8 text-left text-[#1A1B1E]">
                        <div className="w-full border-l-2 border-[#2C3E50] pl-3">
                            <span className="text-[#F2F1EF] text-[10px] font-black uppercase tracking-widest">Functional Focus</span>
                        </div>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">PETG Functional</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">The right call when your part needs to handle heat, stress, or outdoor conditions.</p>
                        <div className="grid grid-cols-2 gap-6 border-t border-gray-300 pt-8 font-bold text-xs uppercase tracking-widest text-[#1A1B1E]">
                            <div className="space-y-1"><p className="text-[#4A6982]">Resilience</p><p>Chemical/Impact</p></div>
                            <div className="space-y-1"><p className="text-[#4A6982]">Max Temp</p><p>Up to 80°C</p></div>
                        </div>
                        <div className="bg-[#1A1B1E]/5 p-4 border-l-4 border-[#D4A017] italic text-xs font-medium text-gray-600">
                            "If your part needs to handle heat, stress, or outdoor conditions, PETG is the right call."
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-20 p-8 border border-[#D4A017]/20 bg-[#1A1B1E]/5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto md:mx-0">
                <p className="text-gray-600 text-sm font-medium italic text-left">
                    Don't see what you need? I source materials on a per-project basis.
                </p>
                <button 
                    onClick={() => setView('contact')} 
                    className="px-8 py-3 bg-[#1A1B1E] text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all whitespace-nowrap"
                >
                    Send me a message
                </button>
            </div>
        </div>
    </div>
);

export default MaterialsView;

