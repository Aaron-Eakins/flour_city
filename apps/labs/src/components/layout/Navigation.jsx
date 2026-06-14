import React, { useState } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import LogoIcon from '../common/LogoIcon';
import { SITE_CONFIG } from '../../constants/site';
import { useAuth } from '../../context/AuthContext';

const Navigation = ({ view, setView, isScrolled, isHome, openAuth }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [emailDropdownOpen, setEmailDropdownOpen] = useState(false);
    const [emailMobileOpen, setEmailMobileOpen] = useState(false);
    const { user, signOut } = useAuth();

    const navBg = (isHome && !isScrolled && !isMenuOpen) ? 'bg-transparent' : 'bg-[#1A1B1E]';
    const isEmailActive = view === 'audit' || view === 'email-checkup';

    const handleLinkClick = (target) => {
        setView(target);
        setIsMenuOpen(false);
        setEmailDropdownOpen(false);
        setEmailMobileOpen(false);
        window.scrollTo(0, 0);
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-500 py-5 ${navBg} ${isScrolled || !isHome || isMenuOpen ? 'shadow-2xl border-b border-white/5' : ''}`}>
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[#F2F1EF]">

                {/* Logo */}
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleLinkClick('home')}>
                    <LogoIcon className="w-8 h-8" />
                    <div>
                        <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-[#F2F1EF]">
                            {SITE_CONFIG.name.split(' ').slice(0, -1).join(' ')} <span className="text-[#D4A017]">{SITE_CONFIG.name.split(' ').slice(-1)}</span>
                        </h1>
                        <p className="text-[9px] tracking-[0.2em] text-slate-500 uppercase font-bold leading-none mt-1">{SITE_CONFIG.region}</p>
                    </div>
                </div>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center space-x-8 text-[11px] font-black tracking-widest uppercase text-[#F2F1EF]">
                    <button onClick={() => handleLinkClick('home')} className={`hover:text-[#D4A017] transition-colors ${view === 'home' ? 'text-[#D4A017]' : ''}`}>Home</button>

                    {/* Email dropdown */}
                    <div className="relative" onMouseEnter={() => setEmailDropdownOpen(true)} onMouseLeave={() => setEmailDropdownOpen(false)}>
                        <button className={`flex items-center gap-1 hover:text-[#D4A017] transition-colors ${isEmailActive ? 'text-[#D4A017]' : ''}`}>
                            Email <ChevronDown size={11} className={`transition-transform duration-200 ${emailDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {emailDropdownOpen && (
                            <div className="absolute top-full left-0 pt-3">
                                <div className="bg-[#1A1B1E] border border-white/10 shadow-2xl py-2 min-w-[180px]">
                                    <button onClick={() => handleLinkClick('audit')} className={`w-full text-left px-5 py-3 text-[11px] font-black tracking-widest uppercase hover:text-[#D4A017] hover:bg-white/5 transition-colors ${view === 'audit' ? 'text-[#D4A017]' : ''}`}>
                                        Email Analyzer
                                    </button>
                                    <button onClick={() => handleLinkClick('email-checkup')} className={`w-full text-left px-5 py-3 text-[11px] font-black tracking-widest uppercase hover:text-[#D4A017] hover:bg-white/5 transition-colors ${view === 'email-checkup' ? 'text-[#D4A017]' : ''}`}>
                                        Email Checkup
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => handleLinkClick('printing')} className={`hover:text-[#D4A017] transition-colors ${view === 'printing' ? 'text-[#D4A017]' : ''}`}>3D Printing</button>
                    <button onClick={() => handleLinkClick('about')} className={`hover:text-[#D4A017] transition-colors ${view === 'about' ? 'text-[#D4A017]' : ''}`}>About</button>
                    <button onClick={() => handleLinkClick('contact')} className={`hover:text-[#D4A017] transition-colors ${view === 'contact' ? 'text-[#D4A017]' : ''}`}>Contact</button>

                    <div className="h-4 w-px bg-white/10 mx-2"></div>

                    {user ? (
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => handleLinkClick('profile')}
                                className={`flex items-center space-x-2 transition-colors hover:text-[#D4A017] cursor-pointer ${view === 'profile' ? 'text-[#D4A017]' : 'text-[#D4A017]'}`}
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
                </div>

                {/* Mobile hamburger */}
                <div className="md:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-[#F2F1EF] hover:text-[#D4A017] transition-colors">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#1A1B1E] border-t border-white/5 animate-in slide-in-from-top duration-300 overflow-hidden">
                    <div className="flex flex-col p-6 space-y-1 text-[12px] font-black tracking-[0.3em] uppercase text-[#F2F1EF]">
                        <button onClick={() => handleLinkClick('home')} className={`text-left py-3 border-b border-white/5 ${view === 'home' ? 'text-[#D4A017]' : 'text-gray-400'}`}>Home</button>

                        {/* Email group */}
                        <div className="border-b border-white/5">
                            <button onClick={() => setEmailMobileOpen(!emailMobileOpen)} className={`w-full text-left py-3 flex items-center justify-between ${isEmailActive ? 'text-[#D4A017]' : 'text-gray-400'}`}>
                                <span>Email</span>
                                <ChevronDown size={12} className={`transition-transform duration-200 ${emailMobileOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {emailMobileOpen && (
                                <div className="pl-4 pb-3 space-y-1">
                                    <button onClick={() => handleLinkClick('audit')} className={`w-full text-left py-2 text-[11px] tracking-widest ${view === 'audit' ? 'text-[#D4A017]' : 'text-gray-500'}`}>Email Analyzer</button>
                                    <button onClick={() => handleLinkClick('email-checkup')} className={`w-full text-left py-2 text-[11px] tracking-widest ${view === 'email-checkup' ? 'text-[#D4A017]' : 'text-gray-500'}`}>Email Checkup</button>
                                </div>
                            )}
                        </div>

                        <button onClick={() => handleLinkClick('printing')} className={`text-left py-3 border-b border-white/5 ${view === 'printing' ? 'text-[#D4A017]' : 'text-gray-400'}`}>3D Printing</button>
                        <button onClick={() => handleLinkClick('about')} className={`text-left py-3 border-b border-white/5 ${view === 'about' ? 'text-[#D4A017]' : 'text-gray-400'}`}>About</button>
                        <button onClick={() => handleLinkClick('contact')} className={`text-left py-3 border-b border-white/5 ${view === 'contact' ? 'text-[#D4A017]' : 'text-gray-400'}`}>Contact</button>

                        {user ? (
                            <>
                                <button onClick={() => handleLinkClick('profile')} className={`py-3 flex items-center space-x-2 text-left ${view === 'profile' ? 'text-[#D4A017]' : 'text-[#D4A017]'}`}>
                                    <User size={16} />
                                    <span className="font-black">{user.user_metadata?.full_name || user.email}</span>
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
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
