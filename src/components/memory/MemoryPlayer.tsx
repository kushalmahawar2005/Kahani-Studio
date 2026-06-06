"use client";

import { useRef, useState } from "react";
import type { Memory } from "@/lib/memories";

export default function MemoryPlayer({ memory }: { memory: Memory }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function play() {
    setPlaying(true);
    // let the element mount, then play with sound
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {});
    });
  }

  return (
    <main className="min-h-screen bg-[#0d0d0c] text-[#F9F9EA] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C9A24B]">
            Kahani Clicks · Living Memory
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl italic">{memory.coupleName}</h1>
          {memory.subtitle && (
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.35em] text-[#F9F9EA]/50">
              {memory.subtitle}
            </p>
          )}
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] aspect-[3/4] bg-black">
          {!playing ? (
            <button onClick={play} className="group absolute inset-0 h-full w-full" aria-label="Play memory">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={memory.poster} alt={memory.coupleName} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F9F9EA]/95 text-[#0d0d0c] shadow-xl transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.4em] text-[#F9F9EA]/80">
                Tap to watch
              </span>
            </button>
          ) : (
            <video
              ref={videoRef}
              src={memory.video}
              poster={memory.poster}
              controls
              playsInline
              className="h-full w-full bg-black object-contain"
            />
          )}
        </div>

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-[#F9F9EA]/35">
          Scan · Watch · Cherish
        </p>
      </div>
    </main>
  );
}
