import React from 'react';
import { Globe, Server, Wrench, Plug, ArrowRight } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import Button from '../components/common/Button';

const SERVICES = [
    {
        icon: Globe,
        title: 'DNS & Domains',
        body: 'Untangle DNS records, migrate domains, and get your mail and hosting pointing where they should.',
    },
    {
        icon: Server,
        title: 'Hosting & Deployment',
        body: "Get your site live and keep it running. Have a setup? I'll work with it. Need one? I'll set you up the right way.",
    },
    {
        icon: Wrench,
        title: 'Site Updates & Fixes',
        body: 'Content changes, broken layouts, slow pages, mobile issues. The small stuff that piles up, finally off your plate.',
    },
    {
        icon: Plug,
        title: 'Integrations',
        body: "Contact forms, scheduling, review widgets, chat tools, analytics. If your business uses a third-party service, I'll connect it to your site and make it work.",
    },
];

const WebDesignView = ({ setView }) => (
    <div className="animate-in fade-in duration-700">
        {/* Header Section */}
        <section className="relative pt-40 pb-24 overflow-hidden bg-[#1A1B1E] text-[#F2F1EF]">
            <div className="absolute inset-0 z-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="absolute border-t border-slate-500 w-full" style={{ top: `${i * 5}%`, transform: `skewY(-2deg)` }}></div>
                ))}
            </div>
            <div className="relative z-20 max-w-7xl mx-auto px-6">
                <header className="space-y-12 text-left">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Web &amp; Site Work</span>
                    <DimensionedHeader line1="WEB & SITE" line2="WORK." layerHt="Rochester·NY" partWd="Build·Fix·Integrate" variant="dark" showUnits={false} />
                    <p className="text-gray-400 max-w-2xl font-medium leading-relaxed text-lg text-left">If it touches the web, I can help. From a full build to a single broken form.</p>
                </header>
            </div>
        </section>

        {/* Content Section */}
        <section className="py-24 bg-[#F2F1EF] text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6">

                <section className="grid md:grid-cols-2 gap-8 mb-20">
                    {SERVICES.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="bg-[#1A1B1E] p-8 rounded-sm text-[#F2F1EF] space-y-4">
                            <div className="flex items-center gap-3 text-[#D4A017]">
                                <Icon size={18} />
                                <h3 className="text-sm font-black uppercase tracking-widest italic text-white">{title}</h3>
                            </div>
                            <p className="text-sm font-medium leading-relaxed text-slate-400">{body}</p>
                        </div>
                    ))}
                </section>

                {/* Closing CTA */}
                <section className="max-w-3xl">
                    <h2 className="font-display text-3xl font-black uppercase italic tracking-tighter mb-4">Not sure if it fits?</h2>
                    <p className="text-gray-600 text-lg font-medium leading-relaxed mb-8">
                        Scope varies a lot with this kind of work, so the best place to start is a quick conversation.
                    </p>
                    <Button variant="secondary" onClick={() => setView('contact')}>
                        Get in touch <ArrowRight size={14} />
                    </Button>
                </section>

            </div>
        </section>
    </div>
);

export default WebDesignView;
