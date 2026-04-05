import React from 'react';
import { Shield, Layers, FileCode, Eye, Cpu, Truck, CheckCircle } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';

const ProcessView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-1000 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6 text-left">
            <header className="mb-16 space-y-4">
                <span className="text-[#D4A017] font-mono tracking-[0.4em] uppercase text-xs font-black">Industrial Lifecycle</span>
                <DimensionedHeader line1="HOW IT" line2="WORKS." layerHt="0.20mm" partWd="142.8mm" variant="light" />
            </header>

            <div className="grid md:grid-cols-2 gap-8 mb-20 text-left">
                <div className="p-8 bg-[#1A1B1E] text-white rounded-sm space-y-4 shadow-xl">
                    <div className="flex items-center space-x-3 text-[#D4A017]"><Shield size={20} /><h4 className="text-sm font-black uppercase tracking-widest italic text-white">The Technician's Shield</h4></div>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">CAD structural integrity is the client's responsibility. Fails due to geometry constraints are subject to a **$25.00 Lab Reset Fee**.</p>
                </div>
                <div className="p-8 bg-[#EAE8E4] border border-gray-300 rounded-sm space-y-4 shadow-xl">
                    <div className="flex items-center space-x-3 text-[#2C3E50]"><Layers size={20} /><h4 className="text-sm font-black uppercase tracking-widest italic text-[#1A1B1E]">Support Policy</h4></div>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">All parts ship as **Raw Lab Output** with supports intact. This protects delicate features during transit.</p>
                </div>
            </div>

            <div className="space-y-12 relative text-[#1A1B1E]">
                {[
                    { id: "01", title: "Configuration", icon: <FileCode className="w-8 h-8" />, desc: "Define your requirements using QuoteLab. Opt for Visual Validation if you require macro photos.", items: ["Secure Upload", "Validation Check"] },
                    { id: "02", title: "Lab Review", icon: <Eye className="w-8 h-8" />, desc: "Every project receives a dedicated review within 24 hours to validate buildability.", items: ["DFM Audit", "Pricing Quote"] },
                    { id: "03", title: "Production", icon: <Cpu className="w-8 h-8" />, desc: "Your project enters our professional queue, utilizing AMS technology for multi-material fidelity.", items: ["Atmospheric Control", "Layer QC"] },
                    { id: "04", title: "Fulfilment", icon: <Truck className="w-8 h-8" />, desc: "Final parts are secured and shipped nationwide from our Rochester hub.", items: ["Secure Shipping", "Regional Express"] }
                ].map((step, idx) => (
                    <div key={idx} className="bg-[#EAE8E4]/50 border border-gray-300 p-10 rounded-sm grid md:grid-cols-12 gap-8 items-start group hover:shadow-2xl transition-all relative z-10 text-[#1A1B1E]">
                        <span className="md:col-span-1 text-5xl font-black text-[#D4A017]/20 font-mono group-hover:text-[#D4A017] transition-colors">{step.id}</span>
                        <div className="md:col-span-8 flex items-start space-x-6 text-left">
                            <div className="p-3 bg-[#1A1B1E] text-[#D4A017] rounded-sm shrink-0 shadow-lg">{step.icon}</div>
                            <div><h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4">{step.title}</h3><p className="text-gray-600 font-medium leading-relaxed text-lg">{step.desc}</p></div>
                        </div>
                        <div className="md:col-span-3 border-l border-gray-300 pl-8 hidden md:block space-y-4 text-left">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Milestones</h4>
                            <ul className="space-y-2">{step.items.map((item, i) => (<li key={i} className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-500"><CheckCircle size={10} className="text-[#D4A017]" /><span>{item}</span></li>))}</ul>
                        </div>
                    </div>
                ))}
                <div className="hidden md:block absolute left-[3.5rem] top-24 bottom-24 w-px bg-gray-300 opacity-50 z-0"></div>
            </div>
        </div>
    </div>
);

export default ProcessView;
