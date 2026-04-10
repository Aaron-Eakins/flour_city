import React from 'react';
import { Waves, Anchor, Compass, Cpu, Leaf } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import OpticsIcon from '../components/common/OpticsIcon';
import LogoIcon from '../components/common/LogoIcon';

const HeritageView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-1000 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6 text-left">
            <header className="mb-32 space-y-12 text-left">
                <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">The Archive</span>
                <DimensionedHeader line1="BUILT TO" line2="LAST." layerHt="0.16mm" partWd="180mm" variant="light" />
                <p className="text-gray-500 max-w-xl font-medium leading-relaxed text-xl italic text-left">"Continuing Rochester's 200-year tradition of making things that work."</p>
            </header>
            <div className="space-y-40 relative text-left">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 hidden md:block opacity-30"></div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 text-right order-2 md:order-1">
                        <span className="text-4xl font-black text-[#D4A017] italic">1817</span>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-[#1A1B1E]">The Genesee Force</h3>
                        <p className="text-gray-600 font-medium leading-relaxed text-right">Water-powered mills earned Rochester its name. Precision was measured in the turn of the stone.</p>
                    </div>
                    <div className="flex justify-center order-1 md:order-2">
                        <div className="w-64 h-64 bg-[#2C3E50] flex items-center justify-center rounded-sm shadow-2xl relative">
                            <Waves size={80} className="text-white/10" />
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#F2F1EF] border border-[#D4A017]/30 flex items-center justify-center shadow-lg">
                                <Anchor size={24} className="text-[#D4A017]" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                    <div className="flex justify-center order-1">
                        <div className="w-64 h-64 bg-emerald-900 flex items-center justify-center rounded-sm shadow-2xl relative">
                            <Leaf size={80} className="text-white/10" />
                            <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#F2F1EF] border border-[#D4A017]/30 flex flex-col items-center justify-center shadow-lg">
                                <Leaf size={20} className="text-[#D4A017]" />
                                <span className="text-[8px] font-black uppercase text-[#D4A017]">Growth</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 text-left order-2">
                        <span className="text-4xl font-black text-[#D4A017] italic">1850</span>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-[#1A1B1E]">The Flower City</h3>
                        <p className="text-gray-600 font-medium leading-relaxed text-left text-[#1A1B1E]">As the mills moved west, Rochester turned to the earth. The region became the nursery capital of the country.</p>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="flex justify-center">
                        <div className="w-72 h-72 bg-[#1A1B1E] flex items-center justify-center rounded-sm shadow-2xl relative text-[#1A1B1E]">
                            <OpticsIcon className="w-40 h-40 text-white/20" />
                            <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#F2F1EF] border border-[#D4A017]/30 flex flex-col items-center justify-center shadow-lg">
                                <Compass size={20} className="text-[#D4A017]" />
                                <span className="text-[8px] font-black uppercase text-[#D4A017]">Precision</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6 text-left">
                        <span className="text-4xl font-black text-[#D4A017] italic">1945</span>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-[#1A1B1E]">The Technical Hub</h3>
                        <p className="text-gray-600 font-medium text-lg leading-relaxed text-left text-[#1A1B1E]">Rochester became the world's center for precision engineering, shifting from river power to the physics of light.</p>
                    </div>
                </div>
                {/* 2026 Digital Mill Section */}
                <div className="grid md:grid-cols-2 gap-12 items-center text-left">
                    <div className="space-y-6 text-right order-2 md:order-1">
                        <span className="text-4xl font-black text-[#D4A017] italic">{new Date().getFullYear()}</span>
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-[#1A1B1E]">The Digital Mill</h3>
                        <p className="text-gray-600 font-medium leading-relaxed text-[#1A1B1E] text-right">Flour City Labs continues that tradition layer by layer, with a printer instead of a mill.</p>
                    </div>
                    <div className="flex justify-center order-1 md:order-2">
                        <div className="w-64 h-64 bg-[#1A1B1E] flex items-center justify-center rounded-sm shadow-2xl relative">
                            <LogoIcon className="w-32 h-32 opacity-20" />
                            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-[#F2F1EF] border border-[#D4A017]/30 flex items-center justify-center shadow-lg">
                                <Cpu size={24} className="text-[#D4A017]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default HeritageView;

