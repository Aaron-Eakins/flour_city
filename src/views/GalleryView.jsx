import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import DimensionedHeader from '../components/common/DimensionedHeader';

const GalleryView = () => {
    const galleryItems = [
        { title: "Archival Miniature", material: "PLA Matte", resolution: "0.08mm Fine", nozzle: "0.2mm", tag: "Detailed" },
        { title: "Industrial Pivot", material: "PETG Functional", resolution: "0.28mm Rough", nozzle: "0.6mm", tag: "Strength" },
        { title: "AMS Corporate Logo", material: "PLA Multi-Color", resolution: "0.20mm Std", nozzle: "0.4mm", tag: "Aesthetic" },
        { title: "Structural Housing", material: "PETG Solid", resolution: "0.20mm Std", nozzle: "0.4mm", tag: "Functional" },
        { title: "Rapid Gear Proto", material: "PLA Standard", resolution: "0.28mm Draft", nozzle: "0.8mm", tag: "Speed" },
        { title: "Archival Stone Dial", material: "PLA Matte Slate", resolution: "0.12mm Detail", nozzle: "0.4mm", tag: "Detailed" }
    ];

    return (
        <div className="pt-40 pb-24 bg-[#F2F1EF] min-h-screen animate-in fade-in duration-700 text-[#1A1B1E]">
            <div className="max-w-7xl mx-auto px-6 text-left">
                <header className="mb-20 space-y-8 text-left">
                    <div className="inline-block px-4 py-1 border border-[#D4A017] text-[#D4A017] text-[10px] font-black uppercase tracking-[0.4em]">Visual Validation</div>
                    <DimensionedHeader line1="LAB" line2="OUTPUTS." layerHt="0.08mm" partWd="114.2mm" variant="light" />
                    <p className="text-gray-500 max-w-2xl font-medium leading-relaxed text-lg text-left text-[#1A1B1E]">A visual archive of technical fidelity across our material library and nozzle architectures.</p>
                </header>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {galleryItems.map((item, idx) => (
                        <div key={idx} className="group bg-[#EAE8E4] border border-gray-300 rounded-sm overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col">
                            <div className="aspect-square bg-[#1A1B1E] relative flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                                <ImageIcon size={64} className="text-[#D4A017] opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 right-4 px-3 py-1 bg-[#D4A017] text-[#1A1B1E] text-[9px] font-black uppercase tracking-widest leading-none">{item.tag}</div>
                            </div>
                            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between text-left">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black uppercase italic tracking-tighter">{item.title}</h4>
                                    <p className="text-[10px] font-black text-[#D4A017] uppercase tracking-widest">{item.material}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-300 text-[9px] font-black uppercase tracking-widest text-gray-500">
                                    <div className="space-y-1"><p className="opacity-50 text-[8px]">Resolution</p><p className="text-[#1A1B1E]">{item.resolution}</p></div>
                                    <div className="space-y-1"><p className="opacity-50 text-[8px]">Nozzle</p><p className="text-[#1A1B1E]">{item.nozzle}</p></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GalleryView;

