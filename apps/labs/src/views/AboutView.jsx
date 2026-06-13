import React from 'react';
import { Cpu } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import LogoIcon from '../components/common/LogoIcon';

const AboutView = ({ setView }) => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-1000 text-[#1A1B1E]">
        <div className="max-w-7xl mx-auto px-6">

            {/* Hero — who & what */}
            <header className="mb-24 space-y-12 text-left">
                <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">About</span>
                {/* TODO: Aaron — pick your headline. Options: "ROCHESTER MADE." or "ONE PERSON. NO SHORTCUTS." */}
                <DimensionedHeader line1="ONE PERSON." line2="NO SHORTCUTS." layerHt="Rochester·NY" partWd="Est·2024" variant="light" />
            </header>

            {/* Bio */}
            <div className="grid md:grid-cols-2 gap-16 mb-24 items-start">
                <div className="space-y-6">
                    {/* TODO: Aaron — rewrite this bio in your own words. The draft is a starting point only. */}
                    <p className="text-gray-600 text-lg font-medium leading-relaxed">
                        I'm Aaron, and Flour City Labs is my one-person shop in Rochester. I work as a website support technician by day, which is where I spend a lot of time fixing the unglamorous things that break small businesses' email and websites — SPF records, DNS settings, deliverability problems most owners don't know they have until something stops working.
                    </p>
                    <p className="text-gray-600 text-lg font-medium leading-relaxed">
                        Flour City Labs is where I do that work directly for local businesses, plus 3D printing for anyone who needs a part made well. No team, no upsell machine. Just careful technical work from someone who likes getting the details right.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="p-8 bg-[#1A1B1E] text-[#F2F1EF] rounded-sm space-y-6">
                        <div>
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017] mb-2">Web &amp; Email Consulting</p>
                            <p className="text-sm font-medium leading-relaxed text-gray-300">I help small businesses fix what's quietly hurting them: email landing in spam, broken DNS, deliverability problems. I find it, explain it in plain English, and fix it.</p>
                            <button onClick={() => setView('email-checkup')} className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#D4A017] hover:text-white transition-colors">
                                Get a free checkup →
                            </button>
                        </div>
                        <div className="border-t border-white/10 pt-6">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017] mb-2">3D Printing</p>
                            <p className="text-sm font-medium leading-relaxed text-gray-300">Small-run parts, prototypes, and one-offs on a Bambu Lab P1S. Upload a file and I'll quote it.</p>
                            <button onClick={() => setView('printing')} className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#D4A017] hover:text-white transition-colors">
                                Open the QuoteLab →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Flour City */}
            <section className="mb-24 max-w-3xl">
                <h2 className="font-display text-3xl font-black uppercase italic tracking-tighter mb-6">Why "Flour City"</h2>
                <p className="text-gray-600 text-lg font-medium leading-relaxed">
                    Rochester was the Flour City before it was anything else. In the 1830s its Genesee River mills made it the largest flour producer in the world. When milling moved west, the nurseries took over and the city quietly renamed itself the Flower City — same sound, different spelling, a small civic pun that stuck. Either way, the through-line is the same: Rochester has always been a place that makes things. That's the part I'm continuing.
                </p>
            </section>

            {/* Timeline — newest first */}
            <section>
                <h2 className="font-display text-3xl font-black uppercase italic tracking-tighter mb-12 text-[#1A1B1E]">The Making Tradition</h2>
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
                        <div key={entry.year} className={`grid md:grid-cols-[120px_1fr] gap-6 items-start border-l-2 pl-6 ${entry.current ? 'border-[#D4A017]' : 'border-gray-300'}`}>
                            <div>
                                <span className={`font-display text-3xl font-black italic ${entry.current ? 'text-[#D4A017]' : 'text-gray-400'}`}>{entry.year}</span>
                            </div>
                            <div className="space-y-2">
                                <h3 className={`font-display text-xl font-black uppercase italic tracking-tighter ${entry.current ? 'text-[#1A1B1E]' : 'text-gray-700'}`}>{entry.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">{entry.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    </div>
);

export default AboutView;
