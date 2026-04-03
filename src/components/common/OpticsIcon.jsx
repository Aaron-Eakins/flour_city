import React from 'react';

const OpticsIcon = ({ className = "w-32 h-32" }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="50" cy="50" r="45" strokeOpacity="0.2" strokeDasharray="2 4" />
        <circle cx="50" cy="50" r="30" />
        <path d="M50 20 L50 10 M50 90 L50 80 M20 50 L10 50 M90 50 L80 50" />
        <path d="M50 30 L65 50 L50 70 L35 50 Z" fill="currentColor" fillOpacity="0.1" />
        <circle cx="50" cy="50" r="5" fill="currentColor" />
        <path d="M30 30 L70 70 M70 30 L30 70" strokeOpacity="0.2" />
    </svg>
);

export default OpticsIcon;
