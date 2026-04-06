import React from 'react';

/**
 * DimensionedHeader
 * Uses Solid text to ensure 100% stability across all screen types.
 * pt-12 ensures that the vertical leader line and italic text variants 
 * have enough clearance from preceding elements.
 */
const DimensionedHeader = ({
    line1,
    line2,
    layerHt = "0.08mm",
    partWd = "114.2mm",
    variant = "dark"
}) => {
    const isDark = variant === "dark";
    const textColor = isDark ? "text-[#F2F1EF]" : "text-[#1A1B1E]";

    return (
        <div className="relative inline-block pt-12 max-w-full">
            {/* HT Leader Line (Vertical) */}
            <div className="absolute -left-10 md:-left-16 top-12 bottom-10 flex flex-col items-center">
                <div className="w-px h-full bg-[#D4A017] opacity-40"></div>
                <div className="absolute top-1/2 -translate-y-1/2 -left-6 md:-left-8">
                    <div className="rotate-[-90deg] whitespace-nowrap text-[8px] md:text-[10px] font-mono font-black tracking-[0.4em] text-[#D4A017] uppercase">
                        Ht_{layerHt}
                    </div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#D4A017]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#D4A017]"></div>
            </div>

            {/* SOLID TEXT BLOCK: Fluid scaling prevents collision */}
            <div className="relative z-10 text-left">
                <h2 className={`text-[clamp(2.5rem,12vw,7rem)] font-black tracking-tighter uppercase leading-[0.9] italic ${textColor}`}>
                    {line1}
                </h2>
                <h2 className="text-[clamp(2.5rem,12vw,7rem)] font-black tracking-tighter uppercase leading-[0.9] italic text-[#D4A017]">
                    {line2}
                </h2>
            </div>

            {/* WD Leader Line (Horizontal) */}
            <div className="mt-4 md:mt-8 relative h-10 w-full">
                <div className="w-full h-px bg-[#D4A017] opacity-40"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-3 bg-[#D4A017]"></div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-[#D4A017]"></div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <p className="text-[8px] md:text-[10px] font-mono font-black tracking-[0.4em] text-[#D4A017] uppercase whitespace-nowrap">
                        Wd_{partWd}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DimensionedHeader;

