import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import HomeView from './views/HomeView';
import PrintingView from './views/PrintingView';
import AboutView from './views/AboutView';
import ServicesView from './views/ServicesView';
import EmailView from './views/EmailView';
import WebDesignView from './views/WebDesignView';
import GalleryView from './views/GalleryView';
import TOSView from './views/TOSView';
import PrivacyView from './views/PrivacyView';
import ContactView from './views/ContactView';
import ProfileView from './views/ProfileView';
import AuthModal from './components/auth/AuthModal';
import { useAuth } from './context/AuthContext';

const App = () => {
    const { user } = useAuth();
    const [view, setView] = useState('home');
    const [isScrolled, setIsScrolled] = useState(false);
    const [quoteStep, setQuoteStep] = useState(1);
    const [isUploading, setIsUploading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showInactivityWarning, setShowInactivityWarning] = useState(false);
    const [countdown, setCountdown] = useState(180); // 3 minutes in seconds
    const countdownIntervalRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '', email: '', selectedMaterial: 'PLA - Matte', intent: '',
        colorCount: 1, selectedColors: ['', '', '', ''],
        visualValidation: false, fileName: '', storagePath: '',
        nozzle: '', infill: '', walls: '', speed: '', layer_height: '', supports: '',
        shipping_address: '', city: '', state: '', zip: '', _honeypot: ''
    });

    const navigateTo = (newView) => {
        window.location.hash = newView;
    };

    useEffect(() => {
        if (user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(prev => ({
                ...prev,
                email: user.email || prev.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name || prev.name
            }));
        }
    }, [user]);

    // Inactivity Timeout Management
    const { signOut } = useAuth();
    useEffect(() => {
        if (!user) return;

        let warningTimer;
        let logoutTimer;
        
        const WARNING_LIMIT = 57 * 60 * 1000; // 57 minutes
        const TOTAL_LIMIT = 60 * 60 * 1000;    // 60 minutes

        const startTimers = () => {
            if (warningTimer) clearTimeout(warningTimer);
            if (logoutTimer) clearTimeout(logoutTimer);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            
            setShowInactivityWarning(false);
            setCountdown(180);

            // Set Warning Timer (57 mins)
            warningTimer = setTimeout(() => {
                setShowInactivityWarning(true);
                // Start Countdown Interval
                countdownIntervalRef.current = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            clearInterval(countdownIntervalRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }, WARNING_LIMIT);

            // Set Hard Logout Timer (60 mins)
            logoutTimer = setTimeout(() => {
                console.log('Security Protocol: Automated Logout due to 60m inactivity.');
                signOut();
            }, TOTAL_LIMIT);
        };

        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const handleActivity = () => {
            if (!showInactivityWarning) {
                startTimers();
            }
        };

        activityEvents.forEach(event => window.addEventListener(event, handleActivity));
        startTimers();

        return () => {
            if (warningTimer) clearTimeout(warningTimer);
            if (logoutTimer) clearTimeout(logoutTimer);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [user, signOut, showInactivityWarning]);

    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Backward-compat: remap retired hash routes to their replacements
        const HASH_REDIRECTS = { 'email-checkup': 'email', 'audit': 'email' };

        const handleHashChange = () => {
            let hash = window.location.hash.replace('#', '') || 'home';
            if (HASH_REDIRECTS[hash]) {
                hash = HASH_REDIRECTS[hash];
                window.history.replaceState(null, '', `#${hash}`);
            }
            setView(hash);
        };
        
        window.addEventListener('hashchange', handleHashChange);
        
        if (window.location.hash) {
            handleHashChange();
        } else {
            window.history.replaceState(null, '', '#home');
        }
        
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [view]);

    return (
        <div className="min-h-screen bg-[#F2F1EF] font-sans selection:bg-[#D4A017] selection:text-[#1A1B1E] overflow-x-hidden text-[#1A1B1E]">
            <Navigation 
                view={view} 
                setView={navigateTo} 
                isScrolled={isScrolled} 
                isHome={view === 'home'} 
                openAuth={() => setShowAuthModal(true)}
            />
            
            <main>
                {view === 'home' && <HomeView setView={navigateTo} />}
                {view === 'services' && <ServicesView setView={navigateTo} />}
                {view === 'email' && <EmailView setView={navigateTo} />}
                {view === 'printing' && (
                    <PrintingView
                        quoteStep={quoteStep} setQuoteStep={setQuoteStep}
                        isUploading={isUploading} setIsUploading={setIsUploading}
                        showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
                        formData={formData} setFormData={setFormData}
                        setView={navigateTo}
                        openAuth={() => setShowAuthModal(true)}
                    />
                )}
                {view === 'about' && <AboutView setView={navigateTo} />}
                {view === 'web-design' && <WebDesignView setView={navigateTo} />}
                {view === 'contact' && <ContactView setView={navigateTo} />}
                {view === 'profile' && <ProfileView setView={navigateTo} />}
                {view === 'gallery' && <GalleryView />}
                {view === 'tos' && <TOSView />}
                {view === 'privacy' && <PrivacyView />}
            </main>

            <Footer setView={navigateTo} />

            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
                setView={navigateTo}
            />

            {/* Inactivity Warning Modal */}
            {showInactivityWarning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#1A1B1E]/95 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-white border-2 border-[#D4A017] p-10 text-center space-y-8 shadow-2xl">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center animate-pulse">
                                <AlertTriangle className="text-[#D4A017] w-8 h-8" />
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#1A1B1E]">Security Timeout</h2>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                You have been inactive for 57 minutes. For your security, you will be logged out in:
                            </p>
                            <div className="flex items-center justify-center space-x-3 text-4xl font-mono font-black text-[#D4A017] py-4 bg-[#F2F1EF] rounded-sm">
                                <Clock size={24} />
                                <span>{formatCountdown(countdown)}</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <button 
                                onClick={() => {
                                    setShowInactivityWarning(false);
                                    setCountdown(180);
                                    // Timers will reset via useEffect activity listener
                                }}
                                className="w-full py-5 bg-[#D4A017] text-[#1A1B1E] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] transition-transform shadow-lg"
                            >
                                Stay Logged In
                            </button>
                            <button 
                                onClick={() => signOut()}
                                className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors"
                            >
                                Log out now
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.15); } }
                .animate-spin-slow { animation: spin-slow 20s linear infinite; }
                .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; transform-origin: center; }
                ::selection { background: #D4A017; color: #1A1B1E; }
            `}</style>
        </div>
    );
};

export default App;

