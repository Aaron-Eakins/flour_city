import React, { useEffect } from 'react';
import DimensionedHeader from '../components/common/DimensionedHeader';
import { SITE_CONFIG } from '../constants/site';


const LegalView = ({ type }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [type]);

    return (
        <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
            <div className="max-w-4xl mx-auto px-6 text-left">
                <header className="mb-16 space-y-8">
                    <span className="text-[#D4A017] font-mono tracking-[0.3em] uppercase text-xs font-bold block mb-4 border-l-2 border-[#D4A017] pl-4">Lab Protocol</span>
                    <DimensionedHeader 
                        line1={type === 'privacy' ? "PRIVACY" : "TERMS OF"} 
                        line2={type === 'privacy' ? "POLICY." : "SERVICE."} 
                        layerHt="0.20mm" 
                        partWd="180mm" 
                        variant="light" 
                    />
                </header>

                <div className="prose prose-slate max-w-none space-y-12">
                    {type === 'privacy' ? (
                        <section className="space-y-6">
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Last Updated: April 2026</p>
                            <p className="text-lg font-medium leading-relaxed italic opacity-80">We take your privacy seriously. Here is how your data is handled within the {SITE_CONFIG.name} pipeline:</p>
                            
                            <div className="space-y-8 mt-12">
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">1. Data Collection</h4>
                                    <p className="text-gray-600 leading-relaxed">When you create a lab account, we collect your name and email address. This is required for secure technical review and project tracking.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">2. Operational Use</h4>
                                    <p className="text-gray-600 leading-relaxed">Your information is used exclusively to manage your account, track your project orders, and transmit technical status updates from our Rochester facility.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">3. Zero-Sharing Policy</h4>
                                    <p className="text-gray-600 leading-relaxed">We do not sell, rent, or share your personal data or CAD geometry with third parties. Your designs stay in the lab.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">4. Technical Security</h4>
                                    <p className="text-gray-600 leading-relaxed">Account credentials and secure storage are managed by Supabase, an industry-standard provider. We do not store or have access to your raw password.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">5. Data Deletion</h4>
                                    <p className="text-gray-600 leading-relaxed">To have your account and associated project history removed from our pipeline, contact <strong>{SITE_CONFIG.email}</strong> and we will process your request promptly.</p>
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="space-y-6">
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Last Updated: April 2026</p>
                            <p className="text-lg font-medium leading-relaxed italic opacity-80">By initiating a project with {SITE_CONFIG.name}, you agree to the following operational protocols:</p>
                            
                            <div className="space-y-8 mt-12">
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">1. Service Scope</h4>
                                    <p className="text-gray-600 leading-relaxed">We provide industrial 3D printing and Additive Manufacturing services based on your submitted digital geometry. {SITE_CONFIG.name} is a fabrication facility; we are not licensed professional engineers.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">2. Technical Safety</h4>
                                    <p className="text-gray-600 leading-relaxed">3D printed parts have inherent limitations, including layer-specific adhesion, material-dependent stress tolerances, and heat resistance. You are solely responsible for ensuring your design is appropriate for its intended application. Our output is <strong>not intended</strong> for safety-critical, medical, or high-risk applications.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">3. IP & Ownership</h4>
                                    <p className="text-gray-600 leading-relaxed">You retain full ownership of any files you upload to the pipeline. We utilize your data only to fulfill your specific order and will never expose your intellectual property.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">4. Liability Limitation</h4>
                                    <p className="text-gray-600 leading-relaxed">{SITE_CONFIG.name} is not liable for damages, equipment failure, or injuries resulting from the use or technical failure of a printed part.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-black uppercase tracking-tighter text-xl">5. Right to Refused Entry</h4>
                                    <p className="text-gray-600 leading-relaxed">The lab reserves the right to decline any project order that is deemed unsafe, illegal, or technically inappropriate for our fleet.</p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
                
                <div className="mt-20 pt-10 border-t border-gray-300">
                    <button 
                        onClick={() => window.history.back()}
                        className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4A017] hover:underline"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalView;
