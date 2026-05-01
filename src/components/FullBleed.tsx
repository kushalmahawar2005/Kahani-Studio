"use client";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useEffect } from "react";

export default function FullBleed({
  src,
  caption,
  meta,
}: {
  src: string;
  caption?: string;
  meta?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  
  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");
  const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    
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
  }, [isInView, isVideo]);

  return (
    <section ref={ref} className="relative w-full h-[85vh] md:h-[100svh] overflow-hidden">
      <motion.div style={{ y }} className="absolute -inset-[8%]">
        {isVideo ? (
          <video
            ref={videoRef}
            src={src}
            loop
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Image
            src={src}
            alt={caption ?? ""}
            fill
            sizes="100vw"
            className="object-cover"
          />
        )}
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
      {(caption || meta) && (
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-14 left-4 sm:left-6 md:left-12 right-4 sm:right-6 md:right-12 flex justify-between items-end text-cream">
          {caption && (
            <h3 className="text-xl sm:text-3xl md:text-6xl font-display italic max-w-2xl">
              {caption}
            </h3>
          )}
          {meta && (
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 text-right">
              {meta}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
