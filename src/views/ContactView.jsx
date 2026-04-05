import React from 'react';
import { Mail } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';

const ContactView = () => (
    <div className="pt-40 pb-20 max-w-7xl mx-auto px-6 text-left min-h-screen bg-[#F2F1EF]">
        <header className="mb-20 space-y-4">
            <span className="text-[#D4A017] font-mono tracking-[0.4em] uppercase text-xs font-black">Direct Access</span>
            <DimensionedHeader line1="CONTACT" line2="THE LAB." layerHt="0.10mm" partWd="192.5mm" variant="light" />
        </header>
        <div className="grid md:grid-cols-2 gap-12 text-[#1A1B1E]">
            <div className="space-y-6">
                <div className="p-8 bg-[#1A1B1E] text-white rounded-sm space-y-4 shadow-xl">
                    <Mail className="text-[#D4A017] w-8 h-8" />
                    <p className="text-xl font-black italic">solutions@flourcitylabs.com</p>
                    <p className="text-xs font-medium opacity-50 uppercase tracking-widest font-mono">Status: Pipeline_Open</p>
                </div>
            </div>
            <div className="bg-[#EAE8E4] border border-gray-300 p-10 rounded-sm shadow-xl space-y-4">
                <h4 className="text-xl font-black uppercase italic">Lab Inquiry</h4>
                <p className="text-sm text-gray-500 italic">Have a custom material request or engineering validation query? Send an email directly to the lead technician.</p>
            </div>
        </div>
    </div>
);

export default ContactView;
