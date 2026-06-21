import React from 'react';
import { Cpu, Mail, ArrowRight } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import Button from '../components/common/Button';
import LogoIcon from '../components/common/LogoIcon';

const AboutView = ({ setView }) => (
    <div className="animate-in fade-in duration-1000">
        {/* Header Section */}
        <section className="relative pt-40 pb-24 overflow-hidden bg-[#1A1B1E] text-[#F2F1EF]">
            <div className="absolute inset-0 z-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute border-t border-slate-500 w-full" style={{ top: `${i * 5}%`, transform: `skewY(-2deg)` }}></div>
                ))}
            </div>
            <div className="relative z-20 max-w-7xl mx-auto px-6">
                <header className="space-y-12 text-left">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">About</span>
                    <DimensionedHeader line1="ONE PERSON." line2="NO SHORTCUTS." layerHt="Rochester·NY" partWd="Est·2026" variant="dark" showUnits={false} />
                </header>
            </div>
        </section>

        {/* Content Section */}
        <section className="py-24 bg-[#F2F1EF] text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">

            {/* Bio */}
            <div className="grid md:grid-cols-2 gap-16 mb-24 items-start">
                <div className="space-y-6">
                        <p className="text-gray-600 text-lg font-medium leading-relaxed">
                        I'm Aaron, and Flour City Labs is my one-person shop in Rochester. I've spent years working with web and infrastructure, which gave me a deep understanding of what breaks small businesses' email and domain setups. I help clients fix those problems and understand what's actually happening under the hood.
                    </p>
                    <p className="text-gray-600 text-lg font-medium leading-relaxed">
                        Plus 3D printing for anyone who needs a part made well. I care about getting the details right, and that's what you get.
                    </p>
                </div>

                <div className="space-y-6">
                    <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-4">
                        <div className="flex items-center gap-3 text-[#D4A017]">
                            <Mail size={18} />
                            <h4 className="text-sm font-black uppercase tracking-widest italic text-white">Web &amp; Email Consulting</h4>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-400">I help small businesses get their web and infrastructure working reliably so they can focus on their business.</p>
                        <div className="pt-4">
                            <Button variant="primary" size="sm" fullWidth onClick={() => setView('email')}>
                                Get a free checkup <ArrowRight size={12} />
                            </Button>
                        </div>
                    </section>

                    <section className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-4">
                        <div className="flex items-center gap-3 text-[#D4A017]">
                            <Cpu size={18} />
                            <h4 className="text-sm font-black uppercase tracking-widest italic text-white">3D Printing</h4>
                        </div>
                        <p className="text-sm font-medium leading-relaxed text-slate-400">Small-run parts, prototypes, and one-offs on a Bambu Lab P1S. Upload a file and I'll quote it.</p>
                        <div className="pt-4">
                            <Button variant="primary" size="sm" fullWidth onClick={() => setView('printing')}>
                                Open the QuoteLab <ArrowRight size={12} />
                            </Button>
                        </div>
                    </section>
                </div>
            </div>

            {/* Why Flour City */}
            <section className="mb-24 max-w-3xl">
                <h2 className="font-display text-3xl font-black uppercase italic tracking-tighter mb-6">Why "Flour City"</h2>
                <p className="text-gray-600 text-lg font-medium leading-relaxed">
                    Rochester was the Flour City before it was anything else. In the 1830s its Genesee River mills made it the largest flour producer in the world. When milling moved west, the nurseries took over and the city quietly renamed itself the Flower City — same sound, different spelling, a small civic pun that stuck. Either way, the through-line is the same: Rochester has always been a place that makes things. That's the part I'm continuing.
                </p>
            </section>
            </div>
        </section>

        {/* Timeline — newest first */}
        <section className="bg-[#1A1B1E] py-24 text-[#F2F1EF]">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="font-display text-3xl font-black uppercase italic tracking-tighter mb-12 text-white">The Making Tradition</h2>
                <div className="space-y-8">
                    {[
                        {
                            year: new Date().getFullYear().toString(),
                            title: 'Flour City Labs',
                            body: 'Web and email consulting and 3D printing, from one person who cares about the details. Precise enough to function. Considered enough to display.',
                            current: true,
                        },
                        {
                            year: '1945',
                            title: 'The Image City',
                            body: 'Rochester became a world center for precision optics and imaging — the physics of light.',
                        },
                        {
                            year: '1859',
                            title: 'The Flower City',
                            body: 'As milling moved west, the Ellwanger & Barry nurseries made Rochester the nursery capital of the country. The nickname shifted; the knack for making didn\'t.',
                        },
                        {
                            year: '1817',
                            title: 'The Flour City',
                            body: 'Water-powered mills on the Genesee made Rochester the largest flour producer in the world. Precision measured in the turn of the stone.',
                        },
                    ].map((entry) => (
                        <div key={entry.year} className={`grid md:grid-cols-[120px_1fr] gap-6 items-start border-l-2 pl-6 ${entry.current ? 'border-[#D4A017]' : 'border-white/10'}`}>
                            <div>
                                <span className={`font-display text-3xl font-black italic ${entry.current ? 'text-[#D4A017]' : 'text-gray-500'}`}>{entry.year}</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className={`font-display text-xl font-black uppercase italic tracking-tighter ${entry.current ? 'text-white' : 'text-gray-400'}`}>{entry.title}</h3>
                                <p className="text-gray-400 font-medium leading-relaxed">{entry.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

export default AboutView;
