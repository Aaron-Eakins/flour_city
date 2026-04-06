import React from 'react';
import { Scale } from 'lucide-react';

const TOSView = () => (
    <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
        <div className="max-w-4xl mx-auto px-6 text-left">
            <header className="mb-16 space-y-4">
                <Scale className="text-[#D4A017] w-12 h-12 mb-4" />
                <h2 className="text-5xl font-black uppercase tracking-tighter italic text-[#1A1B1E]">Terms of Service</h2>
                <p className="text-gray-500 font-medium">FCL Lab Standards & Service Level Agreement (SLA)</p>
            </header>

            <div className="space-y-12 pb-20 text-[#1A1B1E] text-left">
                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">1. Project Minimums & Pricing</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">To maintain our standard of manual quality assurance and technician review, Flour City Labs observes a **$25.00 minimum project threshold**. This fee covers initial design review, machine calibration, and material setup. All quotes are valid for 14 days.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">2. The Technician's Shield (Liability)</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">Structural integrity and dimensional accuracy of the CAD geometry remain the sole responsibility of the client. While FCL performs a "Printability Review," we do not guarantee functional performance of client designs. Projects that fail during production due to geometry constraints are subject to a **$25.00 Lab Reset Fee**.</p>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">3. Raw Lab Output Policy</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">By default, all parts are delivered as **Raw Lab Output**. Support structures remain intact to provide maximum structural rigidity during transit. FCL provides premium finishing only as an explicitly quoted add-on service.</p>
                </section>

                <section className="space-y-4 text-[#1A1B1E]">
                    <h3 className="text-lg font-black uppercase tracking-widest text-[#D4A017]">4. Shipping & Logistics</h3>
                    <p className="text-gray-600 leading-relaxed font-medium">FCL Lab 1 operates as a secure private production facility. Physical site visits are by appointment only. We ensure industrial-grade packaging, however the lab is not liable for third-party courier delays.</p>
                </section>
            </div>
        </div>
    </div>
);

export default TOSView;

