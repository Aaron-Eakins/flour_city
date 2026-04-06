import React from 'react';
import { Lock } from 'lucide-react';

const PrivacyView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-4xl mx-auto px-6 text-left text-[#1A1B1E]">
            <header className="mb-16 space-y-4">
                <Lock className="text-[#D4A017] w-12 h-12 mb-4" />
                <h2 className="text-5xl font-black uppercase tracking-tighter italic text-[#1A1B1E]">Privacy Policy</h2>
                <p className="text-gray-500 font-medium">Data Integrity & Intellectual Property Protocol</p>
            </header>

            <div className="space-y-12 pb-20 text-[#1A1B1E] text-left">
                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">1. CAD Data Integrity</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">We treat your CAD data as proprietary intellectual property. 3D models uploaded are used exclusively for quoting and production. We do not share, sell, or utilize your designs for any purposes other than fulfillment. Files are purged from active servers 30 days post-production.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">2. Personal Information</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">We collect basic contact information to facilitate the quoting pipeline. This data is stored securely and never sold to third-party marketing entities. By using the QuoteLab, you consent to receive technical communications regarding your project.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">3. Local Privacy</h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-[#1A1B1E]">FCL Lab 1 is a private workstation. For the security of our technicians and client projects, our exact physical coordinates are disclosed only during active logistics handoffs.</p>
                </section>
            </div>
        </div>
    </div>
);

export default PrivacyView;
