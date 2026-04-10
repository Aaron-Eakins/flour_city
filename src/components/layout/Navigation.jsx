import React, { useState } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import LogoIcon from '../common/LogoIcon';
import { SITE_CONFIG } from '../../constants/site';

import { useAuth } from '../../context/AuthContext';

const Navigation = ({ view, setView, isScrolled, isHome, openAuth }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, signOut } = useAuth();
    
    const navBg = (isHome && !isScrolled && !isMenuOpen) ? 'bg-transparent' : 'bg-[#1A1B1E]';
    const navItems = ['home', 'materials', 'gallery', 'process', 'heritage', 'contact'];

    const handleLinkClick = (target) => {
        setView(target);
        setIsMenuOpen(false);
        window.scrollTo(0, 0);
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 py-5 ${navBg} ${isScrolled || !isHome || isMenuOpen ? 'shadow-2xl border-b border-white/5' : ''}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[#F2F1EF]">
                <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleLinkClick('home')}>
                    <LogoIcon className="w-8 h-8" />
                    <div>
                        <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-[#F2F1EF]">
                            {SITE_CONFIG.name.split(' ').slice(0, -1).join(' ')} <span className="text-[#D4A017]">{SITE_CONFIG.name.split(' ').slice(-1)}</span>
                        </h1>
                        <p className="text-[9px] tracking-[0.2em] text-slate-500 uppercase font-bold leading-none mt-1">{SITE_CONFIG.region}</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center space-x-8 text-[11px] font-black tracking-widest uppercase text-[#F2F1EF]">
                    {navItems.map((item) => (
                        <button key={item} onClick={() => handleLinkClick(item)} className={`hover:text-[#D4A017] transition-colors ${view === item ? 'text-[#D4A017]' : ''}`}>{item}</button>
                    ))}
                    
                    <div className="h-4 w-px bg-white/10 mx-2"></div>

                    {user ? (
                        <div className="flex items-center space-x-6">
                            <button 
                                onClick={() => handleLinkClick('profile')}
                                className={`flex items-center space-x-2 transition-colors hover:text-[#D4A017] ${view === 'profile' ? 'text-[#D4A017]' : 'text-[#D4A017]'}`}
                            >
                                <User size={14} />
                                <span className="truncate max-w-[120px] text-[9px] font-black uppercase tracking-widest leading-none">
                                    {user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0]}
                                </span>
                            </button>
                            <button onClick={signOut} className="hover:text-red-400 transition-colors flex items-center space-x-2">
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button onClick={openAuth} className="hover:text-[#D4A017] transition-colors flex items-center space-x-2">
                            <User size={14} />
                            <span>Sign In</span>
                        </button>
                    )}

                    <button
                        onClick={() => { handleLinkClick('home'); setTimeout(() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                        className="px-6 py-2 border border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all rounded-sm font-black"
                    >
                        QuoteLab
                    </button>
                </div>

                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[#F2F1EF] hover:text-[#D4A017] transition-colors">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#1A1B1E] border-t border-white/5 animate-in slide-in-from-top duration-300 overflow-hidden">
                    <div className="flex flex-col p-6 space-y-4 text-[12px] font-black tracking-[0.3em] uppercase text-[#F2F1EF]">
                        {navItems.map((item) => (
                            <button key={item} onClick={() => handleLinkClick(item)} className={`text-left py-3 border-b border-white/5 ${view === item ? 'text-[#D4A017]' : 'text-gray-400'}`}>{item}</button>
                        ))}
                        
                        {user ? (
                            <>
                                <button 
                                    onClick={() => handleLinkClick('profile')}
                                    className={`py-3 flex items-center space-x-2 text-left ${view === 'profile' ? 'text-[#D4A017]' : 'text-[#D4A017]'}`}
                                >
                                    <User size={16} />
                                    <span className="font-black">
                                        {user.user_metadata?.full_name || user.email}
                                    </span>
                                </button>
                                <button onClick={signOut} className="text-left py-3 text-red-400 flex items-center space-x-2">
                                    <LogOut size={16} />
                                    <span>Logout Account</span>
                                </button>
                            </>
                        ) : (
                            <button onClick={() => { setIsMenuOpen(false); openAuth(); }} className="text-left py-3 text-[#D4A017] flex items-center space-x-2">
                                <User size={16} />
                                <span>Sign In / Register</span>
                            </button>
                        )}

                        <button onClick={() => { handleLinkClick('home'); setTimeout(() => document.getElementById('quote-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="text-left py-4 text-[#D4A017] font-black uppercase">Access QuoteLab</button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
