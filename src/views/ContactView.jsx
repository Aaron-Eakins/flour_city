import React from 'react';
import { Mail, MapPin, Truck, CheckCircle, MessageSquare } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import LogoIcon from '../components/common/LogoIcon';

const ContactView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6">
            <header className="mb-20 space-y-12 text-left text-[#1A1B1E]">
                <div className="w-fit px-4 py-1 border border-[#D4A017] text-[#D4A017] text-[10px] font-black uppercase tracking-[0.4em]">Region First</div>
                <DimensionedHeader line1="THE" line2="PIPELINE." layerHt="0.10mm" partWd="192.5mm" variant="light" />
                <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left">Operating out of FCL Lab 1 in Rochester's Monroe Ave District. Serving the nationwide additive community with regional dedication.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1 space-y-12 text-left">
                    <section className="space-y-6 text-left">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4A017]">Direct Connection</h4>
                        <div className="space-y-4 font-bold text-sm uppercase tracking-widest text-[#1A1B1E] text-left">
                            <div className="flex items-center space-x-3 text-[#1A1B1E]"><Mail size={16} className="text-[#D4A017]" /><span>solutions@flourcitylabs.com</span></div>
                            <div className="flex items-center space-x-3 text-[#1A1B1E]"><MapPin size={16} className="text-[#D4A017]" /><span>Monroe Ave District, Rochester NY</span></div>
                        </div>
                    </section>

                    <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-6 text-left">
                        <div className="flex items-center space-x-2 text-[#D4A017]"><Truck size={20} /> <h4 className="text-sm font-black uppercase tracking-widest italic text-white">Secure Logistics</h4></div>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed text-left">Every part is secured for cross-country transit. We utilize professional courier networks to ensure Rochester-built precision arrives intact at your door.</p>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-sm flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#D4A017]">Active Pipeline</span>
                            <CheckCircle size={12} className="text-[#D4A017]" />
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-2 bg-[#EAE8E4] border border-gray-300 p-10 md:p-14 rounded-sm shadow-2xl relative overflow-hidden text-left text-[#1A1B1E]">
                    <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none text-[#1A1B1E]">
                        <LogoIcon className="w-full h-full" />
                    </div>

                    <div className="space-y-8 relative z-10 text-left">
                        <div className="space-y-2">
                            <h4 className="text-3xl font-black uppercase italic tracking-tighter">Lab Inquiry</h4>
                            <p className="text-gray-500 text-sm font-medium">Have questions about technical tolerances or custom Autodesk Fusion support? Ask a technician.</p>
                        </div>
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-4 text-left">
                                <input type="text" placeholder="FULL NAME" className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" />
                                <input type="email" placeholder="EMAIL ADDRESS" className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]" />
                            </div>
                            <select className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017]">
                                <option>General Engineering Question</option>
                                <option>Specialized Prototyping Query</option>
                                <option>Business/B2B Partnership</option>
                                <option>Custom Engineering Validation</option>
                            </select>
                            <textarea placeholder="HOW CAN THE LAB ASSIST?" className="w-full p-4 bg-white border border-gray-300 rounded-sm text-xs font-black uppercase tracking-widest outline-none focus:border-[#D4A017] h-40"></textarea>
                            <button className="w-full py-5 bg-[#1A1B1E] text-white font-black uppercase text-xs tracking-[0.4em] hover:bg-[#D4A017] hover:text-[#1A1B1E] transition-all flex items-center justify-center space-x-3">
                                <span>Send Message</span> <MessageSquare size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default ContactView;

