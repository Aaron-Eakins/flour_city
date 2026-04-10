import React, { useState, useEffect, useCallback } from 'react';
import { User, Mail, Box, Clock, MessageSquare, ChevronDown, ChevronUp, Save, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import DimensionedHeader from '../components/common/DimensionedHeader';
import ProjectNoteForm from '../components/dashboard/ProjectNoteForm';
import { SITE_CONFIG } from '../constants/site';

const ProfileView = ({ setView }) => {
    const { user } = useAuth();
    const [quotes, setQuotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedQuote, setExpandedQuote] = useState(null);
    
    // Account Settings state
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [updateStatus, setUpdateStatus] = useState('idle'); // idle, loading, success, error

    const fetchQuotes = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('quotes')
                .select(`
                    *,
                    project_notes (*)
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (err) {
            console.error('Error fetching dashboard data:', err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateStatus('loading');
        const updateData = { data: { full_name: fullName } };
        if (email !== user.email) {
            updateData.email = email;
        }

        try {
            const { error } = await supabase.auth.updateUser(updateData);
            if (error) throw error;
            setUpdateStatus('success');
            setTimeout(() => setUpdateStatus('idle'), 3000);
        } catch {
            setUpdateStatus('error');
        }
    };

    return (
        <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">
                <header className="mb-20 space-y-12 text-left">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-black block mb-4 border-l-2 border-[#D4A017] pl-4">Partner Dashboard</span>
                    <DimensionedHeader line1="THE" line2="PIPELINE." layerHt="AUT" partWd="210mm" variant="light" />
                </header>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Account Settings */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="bg-white border border-gray-300 p-8 rounded-sm shadow-xl">
                            <div className="flex items-center space-x-3 mb-8">
                                <User className="text-[#D4A017]" size={20} />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Account Identity</h4>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Full Name</label>
                                    <input 
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-[#F2F1EF] border border-gray-200 p-3 rounded-sm font-medium text-sm outline-none focus:border-[#D4A017] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">Authorized Email</label>
                                    <input 
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#F2F1EF] border border-gray-200 p-3 rounded-sm font-medium text-sm outline-none focus:border-[#D4A017] transition-all"
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={updateStatus === 'loading'}
                                    className="w-full py-4 bg-[#1A1B1E] text-white font-black uppercase text-[10px] tracking-[0.3em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all flex items-center justify-center space-x-2"
                                >
                                    {updateStatus === 'loading' ? <span>Updating...</span> : (
                                        <>
                                            <Save size={14} />
                                            <span>Update Profile</span>
                                        </>
                                    )}
                                </button>

                                {updateStatus === 'success' && (
                                    <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest text-center animate-in fade-in">Identity Re-Secured</p>
                                )}
                            </form>
                        </section>

                        <div className="p-6 bg-[#1A1B1E] text-white rounded-sm space-y-4">
                            <div className="flex items-center space-x-2 text-[#D4A017]">
                                <AlertCircle size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Lab Connection</span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed font-medium">To change your primary login email, please contact <a href={`mailto:${SITE_CONFIG.email}`} className="text-[#D4A017]">{SITE_CONFIG.email}</a> for manual verification.</p>
                        </div>
                    </div>

                    {/* Inquiry list */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                                <Box className="text-[#D4A017]" size={20} />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Project Tracking</h4>
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{quotes.length} Projects Total</span>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-sm">
                                <div className="w-8 h-8 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Retrieving Pipeline Data...</p>
                            </div>
                        ) : quotes.length === 0 ? (
                            <div className="py-20 bg-white border border-dashed border-gray-300 rounded-sm text-center space-y-4">
                                <p className="text-sm font-medium text-gray-400 italic">No project history found in the pipeline.</p>
                                <button 
                                    onClick={() => setView('home')}
                                    className="px-6 py-2 bg-[#1A1B1E] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all"
                                >
                                    Initiate First Quote
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {quotes.map((quote) => (
                                    <div key={quote.id} className="bg-white border border-gray-300 rounded-sm shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                        <div 
                                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                                            onClick={() => setExpandedQuote(expandedQuote === quote.id ? null : quote.id)}
                                        >
                                            <div className="space-y-1 flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                                        quote.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 
                                                        quote.status === 'Printing' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                                                        'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {quote.status}
                                                    </span>
                                                    <h5 className="text-sm font-black uppercase tracking-tight group-hover:text-[#D4A017] transition-colors">
                                                        {quote.file_name || "General Inquiry"}
                                                    </h5>
                                                </div>
                                                <div className="flex items-center space-x-4 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                    <div className="flex items-center space-x-1"><Calendar size={10} /> <span>{new Date(quote.created_at).toLocaleDateString()}</span></div>
                                                    <div className="flex items-center space-x-1"><Clock size={10} /> <span>{new Date(quote.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">{quote.material || 'General Inquiry'}</p>
                                                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{quote.project_notes?.length || 0} Project Notes</p>
                                                </div>
                                                {expandedQuote === quote.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>

                                        {expandedQuote === quote.id && (
                                            <div className="px-6 pb-6 pt-2 border-t border-gray-100 bg-[#F2F1EF]/30 animate-in slide-in-from-top-2">
                                                <div className="grid md:grid-cols-2 gap-8 mb-8 mt-4">
                                                    <div className="space-y-4">
                                                        <h6 className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">Technical Summary</h6>
                                                        <div className="grid grid-cols-2 gap-y-2 text-[10px] font-medium">
                                                            <span className="text-gray-400">Material:</span> <span className="text-right">{quote.material || 'N/A'}</span>
                                                            <span className="text-gray-400">Spec Loop:</span> <span className="text-right">{quote.walls || 'Standard'}</span>
                                                            <span className="text-gray-400">Core Infill:</span> <span className="text-right">{quote.infill || 'Standard'}</span>
                                                            <span className="text-gray-400">Visuals:</span> <span className="text-right">{quote.visual_validation ? 'Active' : 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h6 className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-2">Project Intent</h6>
                                                        <p className="text-[10px] leading-relaxed text-gray-600 italic">"{quote.intent || 'No description provided.'}"</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <MessageSquare size={14} className="text-[#D4A017]" />
                                                        <h6 className="text-[9px] font-black uppercase tracking-widest">Lab Communication Thread</h6>
                                                    </div>
                                                    
                                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                                                        {quote.project_notes?.length === 0 ? (
                                                            <p className="text-[9px] text-gray-400 italic">No notes appended to this project yet.</p>
                                                        ) : (
                                                            quote.project_notes.sort((a,b) => new Date(a.created_at) - new Date(b.created_at)).map((note) => (
                                                                <div key={note.id} className="p-3 bg-white border border-gray-200 rounded-sm space-y-2">
                                                                    <p className="text-[10px] leading-relaxed">{note.content}</p>
                                                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-gray-400">
                                                                        <span>Client Update</span>
                                                                        <span>{new Date(note.created_at).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    <ProjectNoteForm quoteId={quote.id} onNoteAdded={fetchQuotes} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
