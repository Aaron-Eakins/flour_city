import React from 'react';

/**
 * DimensionedHeader
 * Uses a nested container strategy to keep WD dimensions accurate to text width
 * while providing a 'gutter' for HT leader lines to remain visible.
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
        <div className="relative inline-block pt-12 pl-16 md:pl-20 max-w-full group">
            {/* HT Leader Line (Vertical) - Positioned in the pl gutter */}
            <div className="absolute left-6 md:left-8 top-12 bottom-12 flex flex-col items-center">
                {/* Vertical drafting line */}
                <div className="w-px h-full bg-[#D4A017] opacity-40 relative"></div>
                
                {/* HT Label - Moved outside line to avoid opacity inheritance */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 md:mr-4 opacity-80">
                    <p
                        className="text-[8px] md:text-[10px] font-mono font-black tracking-[0.4em] text-[#D4A017] uppercase whitespace-nowrap"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                        Ht_{layerHt}
                    </p>
                </div>

                {/* Vertical Ticks */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#D4A017]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#D4A017]"></div>
            </div>

            {/* Content Wrapper: This ensures the WD line matches the text width */}
            <div className="relative">
                {/* SOLID TEXT BLOCK */}
                <div className="relative z-10 text-left">
                    <h2 className={`font-display text-[clamp(2.5rem,10vw,7rem)] font-black tracking-tighter uppercase leading-[0.85] italic ${textColor}`}>
                        {line1}
                    </h2>
                    <h2 className="font-display text-[clamp(2.5rem,10vw,7rem)] font-black tracking-tighter uppercase leading-[0.85] italic text-[#D4A017]">
                        {line2}
                    </h2>
                </div>

                {/* WD Leader Line (Horizontal) - Width matches the parent text block */}
                <div className="mt-8 relative h-10 w-full flex items-center">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full h-px bg-[#D4A017] opacity-40"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-3 bg-[#D4A017]"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-3 bg-[#D4A017]"></div>
                    <div className="absolute top-8 md:top-10 left-1/2 -translate-x-1/2 opacity-80">
                        <p className="text-[8px] md:text-[10px] font-mono font-black tracking-[0.4em] text-[#D4A017] uppercase whitespace-nowrap">
                            Wd_{partWd}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DimensionedHeader;






