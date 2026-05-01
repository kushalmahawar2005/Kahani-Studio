"use client";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Reveal from "./Reveal";

export default function Showreel() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1.02, 1.06]);
  const isInView = useInView(ref, { margin: "-40% 0px -40% 0px" });

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isInView) {
      videoRef.current.muted = false;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-24 md:py-40 px-6 md:px-12 bg-[#F9F9EA]">
      <div className="mx-auto max-w-[1800px]">
        <Reveal>
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
                The Reel
              </span>
              <h3 className="mt-3 text-4xl md:text-6xl font-display tracking-tight italic">
                A glance at our cinema.
              </h3>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Selected works · 02:48
            </p>
          </div>
        </Reveal>

        <div className="relative w-full overflow-hidden border border-charcoal/10 group">
          <motion.div
            style={{ scale }}
            className="relative w-full"
          >
            <div className="aspect-[9/16] sm:aspect-[4/5] md:aspect-[21/9] relative">
              <video
                ref={videoRef}
                src="/r1.mp4"
                loop
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-10 md:left-10 text-cream">
            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-70">
              Reel.001
            </p>
            <p className="mt-1 sm:mt-2 text-sm sm:text-lg md:text-2xl font-display italic">Selected · 2024–2026</p>
          </div>
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-10 md:right-10 text-cream text-right hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-70">
              4K · ProRes
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] opacity-70">
              Dolby Atmos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
