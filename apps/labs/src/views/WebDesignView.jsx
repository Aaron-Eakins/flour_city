import React from 'react';
import DimensionedHeader from '../components/common/DimensionedHeader';

const WebDesignView = ({ setView }) => (
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
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Coming Soon</span>
                    <DimensionedHeader line1="WEB" line2="DESIGN." layerHt="Rochester·NY" partWd="Est·2026" variant="dark" showUnits={false} />
                    <p className="text-gray-400 max-w-2xl font-medium leading-relaxed text-lg text-left">This service is currently under development. In the meantime, feel free to reach out if you need help with your website.</p>
                </header>
            </div>
        </section>

        {/* Content Section */}
        <section className="py-24 bg-[#F2F1EF] text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">

            <button
                onClick={() => setView('contact')}
                className="px-10 py-4 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all"
            >
                Get in touch
            </button>

            </div>
        </section>
    </div>
);

export default WebDesignView;
