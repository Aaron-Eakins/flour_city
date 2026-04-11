import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const ProjectNoteForm = ({ quoteId, onNoteAdded }) => {
    const { user, loading } = useAuth();
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [turnstileToken, setTurnstileToken] = useState('');

    useEffect(() => {
        // Stop Turnstile logic entirely for authenticated users
        if (user || loading) return;

        const initTurnstile = () => {
            if (window.turnstile && !turnstileToken) {
                window.turnstile.render('#turnstile-container-note', {
                    sitekey: '0x4AAAAAAC6yWDKB2X7isRW7',
                    callback: (token) => setTurnstileToken(token),
                    theme: 'light'
                });
            }
        };

        if (window.turnstile) {
            initTurnstile();
        } else {
            const timer = setInterval(() => {
                if (window.turnstile) {
                    initTurnstile();
                    clearInterval(timer);
                }
            }, 500);
            return () => clearInterval(timer);
        }
    }, [turnstileToken, user, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!content.trim() || isSubmitting) return;
        if (!user && !turnstileToken) {
            setErrorMessage('Security verification required');
            setStatus('error');
            return;
        }

        setIsSubmitting(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const { data: note, error } = await supabase
                .from('project_notes')
                .insert({
                    quote_id: quoteId,
                    user_id: user.id,
                    content: content.trim()
                })
                .select()
                .single();

            if (error) throw error;

            // MANUAL FETCH BYPASS for 401 issues
            const { data: { session } } = await supabase.auth.getSession();
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`;

            const res = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': anonKey,
                    'Authorization': `Bearer ${session?.access_token || anonKey}`
                },
                body: JSON.stringify({
                    record: note,
                    table: 'project_notes',
                    type: 'INSERT',
                    turnstile_token: user ? undefined : turnstileToken
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Unknown Error' }));
                throw new Error(errData.error || `HTTP ${res.status}`);
            }

            setStatus('success');
            setContent('');
            if (onNoteAdded) onNoteAdded();
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            console.error('Error adding note:', err.message);
            setErrorMessage(err.message);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <form 
            key={user?.id || 'guest'}
            onSubmit={handleSubmit} 
            className="space-y-3 mt-4 animate-in fade-in duration-500"
        >
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a note to the Lab for this project..."
                    required
                    className="w-full bg-[#1A1B1E]/5 border border-gray-300 p-4 rounded-sm font-medium text-xs text-[#1A1B1E] outline-none focus:border-[#D4A017] min-h-[80px] transition-all resize-none"
                    disabled={isSubmitting}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || (!user && !turnstileToken)}
                    className="absolute bottom-3 right-3 p-2 bg-[#1A1B1E] text-white rounded-sm hover:bg-[#D4A017] transition-all disabled:opacity-50"
                >
                    <Send size={14} />
                </button>
            </div>

            {/* Turnstile Container - Guest Only */}
            {!user && <div id="turnstile-container-note" className="flex justify-start py-1"></div>}
            
            {status === 'success' && (
                <div className="flex items-center space-x-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-left-2">
                    <CheckCircle size={12} />
                    <span>Note Dispatched to Lab</span>
                </div>
            )}
            
            {status === 'error' && (
                <div className="flex flex-col space-y-1 animate-in slide-in-from-left-2 text-left">
                    <div className="flex items-center space-x-2 text-red-600 text-[10px] font-black uppercase tracking-widest">
                        <AlertCircle size={12} />
                        <span>Failed to Dispatch Note</span>
                    </div>
                    {errorMessage && (
                        <p className="text-[9px] text-red-500 font-medium pl-5 italic">{errorMessage}</p>
                    )}
                </div>
            )}
        </form>
    );
};

export default ProjectNoteForm;
