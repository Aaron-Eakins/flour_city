import React from 'react';

// Shared CTA button — one place to edit the site's two button roles:
//   primary   = gold, the loud marketing CTA (subtle scale on hover)
//   secondary = dark, fills gold on hover (form submits + quieter actions)
// Hover is intentionally crisp (scale / colour fill), NOT the card shadow-grow —
// buttons and cards should feel like different things.
const VARIANTS = {
    primary: 'bg-[#D4A017] text-[#1A1B1E] hover:bg-amber-400',
    secondary: 'bg-[#1A1B1E] text-white hover:bg-amber-400 hover:text-[#1A1B1E]',
};

const SIZES = {
    sm: 'px-6 py-3 text-[10px] tracking-[0.3em]',
    md: 'px-10 py-4 text-xs tracking-[0.4em]',
    lg: 'px-10 py-5 text-sm tracking-widest',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    ...props
}) {
    return (
        <button
            className={`font-black uppercase rounded-sm transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
