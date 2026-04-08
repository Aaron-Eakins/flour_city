import React from 'react';
import { Scale, HardHat, FileCode, ShieldAlert, OctagonAlert } from 'lucide-react';
import { SITE_CONFIG } from '../constants/site';

const TOSView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-4xl mx-auto px-6 text-left">
            <header className="mb-16 space-y-4">
                <div className="w-16 h-1 w-12 bg-[#D4A017] mb-6"></div>
                <h2 className="text-5xl font-black uppercase tracking-tighter italic text-[#1A1B1E]">Terms of Service</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Last Updated: April 2026</p>
            </header>

            <div className="space-y-12 pb-20">
                <p className="text-lg font-medium leading-relaxed italic opacity-80 border-l-4 border-gray-200 pl-6">
                    By using {SITE_CONFIG.name}, you agree to the following operational protocols:
                </p>

                <div className="space-y-16 mt-16">
                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-12 h-12 bg-[#1A1B1E] text-[#D4A017] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Scale size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter">1. Service scope</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">We provide 3D printing services based on the files you submit. We are not licensed engineers. Technical review is for printability, not structural safety.</p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-12 h-12 bg-[#1A1B1E] text-[#D4A017] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <HardHat size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter">2. Safety Disclaimer</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">3D printed parts have inherent limitations, including layer adhesion, material stress tolerances, and heat resistance. You are responsible for ensuring your design is appropriate for its intended use. Our prints are not intended for safety-critical, medical, or high-risk applications.</p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-12 h-12 bg-[#1A1B1E] text-[#D4A017] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <FileCode size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter">3. File ownership</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">You retain full ownership of any files you upload. We use them only to fulfill your order and will not share or sell your designs.</p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-12 h-12 bg-[#D4A017] text-[#1A1B1E] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <ShieldAlert size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter">4. Liability</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">We are not liable for damages or injuries resulting from the use or failure of a printed part.</p>
                        </div>
                    </section>

                    <section className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-12 h-12 bg-[#1A1B1E] text-[#D4A017] flex items-center justify-center flex-shrink-0 shadow-lg">
                            <OctagonAlert size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter">5. Right to refuse</h3>
                            <p className="text-gray-600 leading-relaxed font-medium">We reserve the right to decline any order that is illegal, unsafe, or otherwise inappropriate for our facilities.</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
);

export default TOSView;
