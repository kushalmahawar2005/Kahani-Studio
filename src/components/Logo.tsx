import React from "react";

export default function Logo({ className = "", iconSize = 28 }: { className?: string, iconSize?: number }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Premium Minimalist Lens / Star Icon */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 60 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="text-[#c5a059] shrink-0"
      >
        <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="30" cy="30" r="18" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <path d="M30 12L33.5 24.5L46 28L33.5 31.5L30 44L26.5 31.5L14 28L26.5 24.5L30 12Z" fill="currentColor"/>
        <circle cx="30" cy="30" r="4" fill="#1a1a1a"/>
      </svg>
      
      {/* Typography */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-[1.05rem] md:text-[1.2rem] font-display font-black tracking-[0.15em] uppercase text-charcoal leading-none">
          KAHANI
        </span>
        <span className="text-[0.85rem] md:text-[0.95rem] font-serif italic font-light lowercase text-charcoal/80 leading-none">
          clicks
        </span>
      </div>
    </div>
  );
}
