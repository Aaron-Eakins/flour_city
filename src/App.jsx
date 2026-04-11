import React, { useState, useEffect } from 'react';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import HomeView from './views/HomeView';
import MaterialsView from './views/MaterialsView';
import GalleryView from './views/GalleryView';
import ProcessView from './views/ProcessView';
import HeritageView from './views/HeritageView';
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
        } else if (view === 'profile') {
            // If user logs out while on profile page, redirect home
            navigateTo('home');
        }
    }, [user, view]);

    // Inactivity Timeout (60 Minutes)
    const { signOut } = useAuth();
    useEffect(() => {
        if (!user) return;

        let timeout;
        const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                console.log('Automated Logout: 60 minutes of inactivity reached.');
                signOut();
            }, INACTIVITY_LIMIT);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        
        resetTimer();

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user, signOut]);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '') || 'home';
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
                {view === 'home' && (
                    <HomeView
                        quoteStep={quoteStep} setQuoteStep={setQuoteStep}
                        isUploading={isUploading} setIsUploading={setIsUploading}
                        showAdvanced={showAdvanced} setShowAdvanced={setShowAdvanced}
                        formData={formData} setFormData={setFormData}
                        setView={navigateTo}
                        openAuth={() => setShowAuthModal(true)}
                    />
                )}
                {view === 'materials' && <MaterialsView setView={navigateTo} />}
                {view === 'gallery' && <GalleryView />}
                {view === 'process' && <ProcessView />}
                {view === 'heritage' && <HeritageView />}
                {view === 'tos' && <TOSView />}
                {view === 'privacy' && <PrivacyView />}
                {view === 'contact' && <ContactView setView={navigateTo} />}
                {view === 'profile' && <ProfileView setView={navigateTo} />}
            </main>

            <Footer setView={navigateTo} />

            <AuthModal 
                isOpen={showAuthModal} 
                onClose={() => setShowAuthModal(false)} 
                setView={navigateTo}
            />
            
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

