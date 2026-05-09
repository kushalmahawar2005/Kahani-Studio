import React from "react";
import Image from "next/image";

export default function Logo({ className = "", iconSize = 28 }: { className?: string, iconSize?: number }) {
  // Use iconSize to derive a clean responsive height for the artwork
  const imgHeight = iconSize * 1.4;

  return (
    <div className={`flex items-center gap-2 md:gap-3 ${className}`}>
      <Image 
        src="/branding_clean.png" 
        alt="Kahani Clicks" 
        width={150} 
        height={150} 
        priority
        style={{ height: `${imgHeight}px`, width: "auto" }}
        className="object-contain"
      />
      
      {/* Typography matching the uploaded design precisely */}
      <div className="flex flex-col items-center justify-center pt-0.5">
        <span className="text-[1.1rem] md:text-[1.3rem] font-display tracking-[0.08em] uppercase text-charcoal leading-none">
          KAHANI
        </span>
        <span className="text-[0.55rem] md:text-[0.65rem] font-sans font-semibold tracking-[0.25em] uppercase text-charcoal/90 mt-1.5 leading-none pl-1">
          CLICKS
        </span>
      </div>
    </div>
  );
}
