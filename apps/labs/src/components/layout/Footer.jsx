import React from 'react';
import { SITE_CONFIG } from '../../constants/site';

const Footer = ({ setView }) => (
    <footer className="bg-[#1A1B1E] text-white pt-20 pb-10 border-t border-white/5 selection:bg-[#D4A017] selection:text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 text-center md:text-left text-[#F2F1EF]">
            <div className="space-y-6 text-left">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 border-2 border-[#D4A017] flex items-center justify-center font-black text-[#D4A017]">FCL</div>
                    <h4 className="text-2xl font-bold tracking-tighter uppercase font-black">{SITE_CONFIG.name}</h4>
                </div>
                <p className="text-gray-500 max-w-sm text-sm font-medium leading-relaxed italic opacity-70">
                    {SITE_CONFIG.tagline}
                </p>
            </div>
            <div className="flex flex-col md:items-end justify-center space-y-4 text-xs font-black uppercase tracking-widest text-gray-400">
                <p>© {new Date().getFullYear()} {SITE_CONFIG.name.toUpperCase()}. BUILT IN ROCHESTER.</p>
                <a href={`mailto:${SITE_CONFIG.email}`} className="text-white opacity-60 lowercase font-bold tracking-tighter hover:text-[#D4A017] transition-colors">{SITE_CONFIG.email}</a>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <div className="flex space-x-8">
                <button onClick={() => { setView('services'); window.scrollTo(0, 0); }} className="hover:text-[#D4A017] transition-colors text-gray-500">Services</button>
                <button onClick={() => { setView('tos'); window.scrollTo(0, 0); }} className="hover:text-[#D4A017] transition-colors text-gray-500">Terms of Service</button>
                <button onClick={() => { setView('privacy'); window.scrollTo(0, 0); }} className="hover:text-[#D4A017] transition-colors text-gray-500">Privacy Policy</button>
            </div>
        </div>
    </footer>
);

export default Footer;
