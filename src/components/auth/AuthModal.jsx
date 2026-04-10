import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LogoIcon from '../common/LogoIcon';

const AuthModal = ({ isOpen, onClose, setView }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (isSignUp) {
                const { error: signUpError } = await signUp(email, password, {
                    data: { full_name: fullName }
                });
                if (signUpError) throw signUpError;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error: signInError } = await signIn(email, password);
                if (signInError) throw signInError;
                setView('profile');
                onClose();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1B1E]/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-md bg-[#F2F1EF] border border-gray-300 shadow-2xl rounded-sm overflow-hidden text-[#1A1B1E]">
                {/* Branding Header */}
                <div className="bg-[#1A1B1E] p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
                        <LogoIcon className="w-full h-full text-[#D4A017]" />
                    </div>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-gray-500 hover:text-[#D4A017] transition-colors"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="relative z-10 space-y-2">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                            {isSignUp ? 'INITIATE ACCOUNT' : 'LAB ACCESS'}
                        </h3>
                        <p className="text-[#D4A017] font-mono text-[10px] font-black uppercase tracking-[0.3em]">
                            {isSignUp ? 'Securing the Pipeline' : 'Authorized Personnel Only'}
                        </p>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-8 md:p-10 space-y-6">
                    {/* Tab Toggle */}
                    <div className="flex border-b border-gray-200">
                        <button 
                            className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest transition-colors ${!isSignUp ? 'border-b-2 border-[#D4A017] text-[#1A1B1E]' : 'text-gray-400 hover:text-[#1A1B1E]'}`}
                            onClick={() => setIsSignUp(false)}
                        >
                            Sign In
                        </button>
                        <button 
                            className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest transition-colors ${isSignUp ? 'border-b-2 border-[#D4A017] text-[#1A1B1E]' : 'text-gray-400 hover:text-[#1A1B1E]'}`}
                            onClick={() => setIsSignUp(true)}
                        >
                            Register
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start space-x-3 text-xs animate-in slide-in-from-top-2">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 flex items-start space-x-3 text-xs animate-in slide-in-from-top-2">
                            <ShieldCheck size={16} className="mt-0.5 flex-shrink-0" />
                            <p className="font-medium">{message}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                required
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="password" 
                                placeholder="Password" 
                                required
                                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-sm text-sm font-medium outline-none focus:border-[#D4A017] transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-5 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center space-x-4 hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all shadow-xl disabled:opacity-50 group"
                        >
                            <span>{loading ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'AUTHENTICATE'}</span>
                            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="pt-4 text-center">
                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-relaxed">
                            Securing the Rochester pipeline with <br /> encrypted identity verification.
                        </p>
                        {isSignUp && (
                            <p className="mt-6 text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center italic">
                                By signing up, you agree to our 
                                <button 
                                    onClick={() => { setView('tos'); onClose(); }}
                                    className="mx-1 text-[#D4A017] underline decoration-[#D4A017]/30 underline-offset-2 hover:decoration-[#D4A017]"
                                >
                                    Terms
                                </button> 
                                and 
                                <button 
                                    onClick={() => { setView('privacy'); onClose(); }}
                                    className="mx-1 text-[#D4A017] underline decoration-[#D4A017]/30 underline-offset-2 hover:decoration-[#D4A017]"
                                >
                                    Privacy Policy
                                </button>.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
