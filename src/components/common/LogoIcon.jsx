import React from 'react';

const LogoIcon = ({ className = "w-10 h-10" }) => (
    <svg viewBox="0 0 100 100" className={`${className} fill-current text-[#D4A017]`}>
        <g className="animate-spin-slow origin-center">
            <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 90c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z" opacity=".2" />
            <path d="M50 10v10M50 80v10M10 50h10M80 50h10M21.7 21.7l7.1 7.1M71.2 71.2l7.1 7.1M21.7 78.3l7.1-7.1M71.2 28.8l7.1-7.1" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </g>
        <circle cx="50" cy="50" r="6" fill="currentColor" className="animate-pulse-slow" />
    </svg>
);

export default LogoIcon;
