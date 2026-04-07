import React from 'react';

const Footer = ({ setView }) => (
    <footer className="bg-[#1A1B1E] text-white pt-20 pb-10 border-t border-white/5 selection:bg-[#D4A017] selection:text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 text-center md:text-left text-[#F2F1EF]">
            <div className="space-y-6 text-left">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 border-2 border-[#D4A017] flex items-center justify-center font-black text-[#D4A017]">FCL</div>
                    <h4 className="text-2xl font-bold tracking-tighter uppercase font-black">Flour City Labs</h4>
                </div>
                <p className="text-gray-500 max-w-sm text-sm font-medium leading-relaxed italic opacity-70">
                    Engineering trust in Rochester's additive future since 2026.
                </p>
            </div>
            <div className="flex flex-col md:items-end justify-center space-y-4 text-xs font-black uppercase tracking-widest text-gray-400">
                <p>© {new Date().getFullYear()} FLOUR CITY LABS. BUILT IN ROCHESTER.</p>
                <p className="text-white opacity-60 lowercase font-bold tracking-tighter">solutions@flourcitylabs.com</p>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <div className="flex space-x-8">
                <button onClick={() => { setView('tos'); window.scrollTo(0, 0); }} className="hover:text-[#D4A017] transition-colors text-gray-500">Terms of Service</button>
                <button onClick={() => { setView('privacy'); window.scrollTo(0, 0); }} className="hover:text-[#D4A017] transition-colors text-gray-500">Privacy Policy</button>
            </div>
            <p className="font-mono tracking-widest">FCL_LAB_1_SATELLITE</p>
        </div>
    </footer>
);

export default Footer;
