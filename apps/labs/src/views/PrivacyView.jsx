import React from 'react';
import { User, Lock, ShieldCheck, Eye, Database, Trash2 } from 'lucide-react';
import { SITE_CONFIG } from '../constants/site';

const PrivacyView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-4xl mx-auto px-6 text-left">
            <header className="mb-16 space-y-4">
                <div className="w-16 h-1 w-12 bg-[#D4A017] mb-6"></div>
                <h2 className="text-5xl font-black uppercase tracking-tighter italic text-[#1A1B1E]">Privacy Policy</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Last Updated: April 2026</p>
            </header>

            <div className="space-y-12 pb-20">
                <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-gray-200 pl-6">
                    We take your privacy seriously. Here is how your data is handled within the {SITE_CONFIG.name} pipeline:
                </p>

                <div className="grid md:grid-cols-2 gap-12 mt-16">
                    <section className="space-y-4 p-8 bg-white border border-gray-200 rounded-sm shadow-sm relative overflow-hidden">
                        <User className="absolute -top-4 -right-4 w-24 h-24 text-gray-100 opacity-50" />
                        <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017] flex items-center gap-3">
                            <Database size={18} /> What we collect
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-medium relative z-10">When you create an account, we collect your name and email address. If you use the Email Analyzer or request a deliverability checkup, we collect the necessary email header data to diagnose your domain. This is the minimum required to provide our services.</p>
                    </section>

                    <section className="space-y-4 p-8 bg-white border border-gray-200 rounded-sm shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017] flex items-center gap-3">
                            <Eye size={18} /> How it's used
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-medium">Your information is used to manage your account, track your 3D printing orders, and send you technical status updates. We may also reach out to you directly regarding the results of your email deliverability checkups.</p>
                    </section>

                    <section className="space-y-4 p-8 bg-white border border-gray-200 rounded-sm shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017] flex items-center gap-3">
                            <ShieldCheck size={18} /> Third-party sharing
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-medium">We do not sell, rent, or share your personal data, email headers, or CAD files with third parties. Ever.</p>
                    </section>

                    <section className="space-y-4 p-8 bg-white border border-gray-200 rounded-sm shadow-sm">
                        <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017] flex items-center gap-3">
                            <Lock size={18} /> Security
                        </h3>
                        <p className="text-gray-600 leading-relaxed font-medium">Account credentials are managed by Supabase, an industry-standard provider. We do not store or have access to your password.</p>
                    </section>
                </div>

                <section className="p-10 bg-[#1A1B1E] text-white rounded-sm space-y-4 shadow-xl">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017] flex items-center gap-3">
                        <Trash2 size={18} /> Data Deletion
                    </h3>
                    <p className="text-gray-400 leading-relaxed font-medium">To have your account and data removed, contact us at <strong><a href={`mailto:${SITE_CONFIG.email}`} className="text-[#D4A017] hover:underline">{SITE_CONFIG.email}</a></strong> and we will process your request promptly.</p>
                </section>
            </div>
        </div>
    </div>
);

export default PrivacyView;
