import React from 'react';
import { Shield, Layers, Cpu, Truck, CheckCircle } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import Button from '../components/common/Button';
import QuoteLab from '../components/quote/QuoteLab';

const PrintingView = (props) => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6">

            {/* Page header */}
            <header className="mb-20 space-y-12 text-left">
                <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">In the workshop</span>
                <DimensionedHeader line1="3D" line2="PRINTING." layerHt="0.20mm" partWd="256mm" variant="light" />
                <p className="text-gray-500 max-w-xl font-medium leading-relaxed text-lg">Small-run parts, prototypes, and one-offs printed on a Bambu Lab P1S. Upload a file, tell me what it's for, and I'll send a quote.</p>
            </header>

            {/* QuoteLab tool */}
            <section className="mb-24">
                <header className="mb-10 space-y-2">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block border-l-2 border-[#D4A017] pl-4">Quote Tool</span>
                    <h2 className="font-display text-4xl font-black uppercase italic tracking-tighter">The QuoteLab</h2>
                </header>
                <QuoteLab
                    quoteStep={props.quoteStep}
                    setQuoteStep={props.setQuoteStep}
                    isUploading={props.isUploading}
                    setIsUploading={props.setIsUploading}
                    showAdvanced={props.showAdvanced}
                    setShowAdvanced={props.setShowAdvanced}
                    formData={props.formData}
                    setFormData={props.setFormData}
                />
            </section>

            {/* Materials */}
            <section className="mb-24">
                <header className="mb-10 space-y-2">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block border-l-2 border-[#D4A017] pl-4">What's in stock</span>
                    <h2 className="font-display text-4xl font-black uppercase italic tracking-tighter">Materials</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">What I keep stocked for most orders. More available on request.</p>
                </header>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b border-gray-300">
                                <th className="text-left py-3 pr-8 text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">Material</th>
                                <th className="text-left py-3 pr-8 text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">Best for</th>
                                <th className="text-left py-3 pr-8 text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">Finish</th>
                                <th className="text-left py-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-100/50 transition-colors">
                                <td className="py-4 pr-8 font-black uppercase">PLA</td>
                                <td className="py-4 pr-8 text-gray-600 font-medium">Detailed models, prototypes, low-stress parts</td>
                                <td className="py-4 pr-8 text-gray-600 font-medium">Matte / Silk / Standard</td>
                                <td className="py-4 text-gray-500 font-medium">Stable up to ~55°C</td>
                            </tr>
                            <tr className="hover:bg-gray-100/50 transition-colors">
                                <td className="py-4 pr-8 font-black uppercase">PETG</td>
                                <td className="py-4 pr-8 text-gray-600 font-medium">Mechanical parts, outdoor use, heat / stress</td>
                                <td className="py-4 pr-8 text-gray-600 font-medium">Glossy / Semi-clear</td>
                                <td className="py-4 text-gray-500 font-medium">Holds up to ~80°C</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <blockquote className="mt-10 border-l-4 border-[#D4A017] pl-6 max-w-xl">
                    <p className="font-display text-xl font-black italic tracking-tight text-[#1A1B1E]">"If your part needs to handle heat, stress, or the outdoors, PETG is the call."</p>
                </blockquote>

                <div className="mt-8 p-6 border border-[#D4A017]/20 bg-[#1A1B1E]/5 rounded-sm flex flex-col md:flex-row items-center justify-between gap-6 max-w-2xl">
                    <p className="text-gray-600 text-sm font-medium italic text-left">
                        Don't see what you need? I source materials per project.
                    </p>
                    <Button variant="secondary" size="sm" className="shrink-0" onClick={() => props.setView('contact')}>
                        Send me a message
                    </Button>
                </div>
            </section>

            {/* Process */}
            <section>
                <header className="mb-10 space-y-2">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block border-l-2 border-[#D4A017] pl-4">From upload to doorstep</span>
                    <h2 className="font-display text-4xl font-black uppercase italic tracking-tighter">How it works</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">Simple process. Careful work.</p>
                </header>

                <div className="space-y-6 relative">
                    {[
                        {
                            id: '01',
                            title: 'Upload',
                            desc: 'Send your file through the QuoteLab. Ask for photos of the finished part before it ships if you want them.',
                            items: ['STL · 3MF · OBJ', 'Visual validation option'],
                        },
                        {
                            id: '02',
                            title: 'Review',
                            desc: "I review every file personally within 24 hours to make sure it's ready to print, then send a quote.",
                            items: ['File review', 'Pricing quote'],
                        },
                        {
                            id: '03',
                            title: 'Print',
                            desc: 'Your part goes in the queue. Multi-color available on request.',
                            items: ['Queue tracking', 'QC checks'],
                        },
                        {
                            id: '04',
                            title: 'Ship',
                            desc: 'Final check, careful packaging, nationwide shipping. Same-day handoff for local orders.',
                            items: ['Nationwide shipping', 'Local same-day'],
                        },
                    ].map((step, idx) => (
                        <div key={idx} className="bg-[#EAE8E4]/50 border border-gray-300 p-8 rounded-sm grid md:grid-cols-12 gap-6 items-start group hover:shadow-xl transition-all">
                            <span className="md:col-span-1 text-5xl font-black text-[#D4A017]/20 font-mono group-hover:text-[#D4A017] transition-colors">{step.id}</span>
                            <div className="md:col-span-8 text-left">
                                <h3 className="font-display text-2xl font-black uppercase italic tracking-tighter mb-3">{step.title}</h3>
                                <p className="text-gray-600 font-medium leading-relaxed">{step.desc}</p>
                            </div>
                            <div className="md:col-span-3 border-l border-gray-300 pl-6 hidden md:block space-y-2">
                                <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400">Milestones</p>
                                <ul className="space-y-1">
                                    {step.items.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                            <CheckCircle size={10} className="text-[#D4A017]" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-10">
                    <div className="p-6 bg-[#1A1B1E] text-white rounded-sm space-y-3">
                        <div className="flex items-center gap-3 text-[#D4A017]">
                            <Shield size={18} />
                            <h4 className="text-sm font-black uppercase tracking-widest italic">Note on file health</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            I check every file before printing, but some issues only show up mid-print. If a failed print traces back to the file, a $25 reset fee covers material and setup.
                        </p>
                    </div>
                    <div className="p-6 bg-[#EAE8E4] border border-gray-300 rounded-sm space-y-3">
                        <div className="flex items-center gap-3 text-[#2C3E50]">
                            <Layers size={18} />
                            <h4 className="text-sm font-black uppercase tracking-widest italic text-[#1A1B1E]">Surface finish</h4>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                            Some finishing may be required where supports and overhangs connect.
                        </p>
                    </div>
                </div>
            </section>

        </div>
    </div>
);

export default PrintingView;
