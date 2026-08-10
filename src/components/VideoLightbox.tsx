"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Volume2, VolumeX, X } from "lucide-react";

type Item = { src: string; title: string; tag: string; poster?: string };

export default function VideoLightbox({
  items,
  index,
  onClose,
  onNav,
}: {
  items: Item[];
  index: number | null;
  onClose: () => void;
  onNav: (next: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNav((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, items.length, onClose, onNav]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  }, [index]);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
  };

  const current = index !== null ? items[index] : null;
  const prevItem = index !== null ? items[(index - 1 + items.length) % items.length] : null;
  const nextItem = index !== null ? items[(index + 1) % items.length] : null;
  const goPrev = () => index !== null && onNav((index - 1 + items.length) % items.length);
  const goNext = () => index !== null && onNav((index + 1) % items.length);

  return (
    <AnimatePresence>
      {current && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
        >
          <p className="absolute left-6 top-6 z-20 text-[10px] font-bold uppercase tracking-[0.4em] text-cream/50 md:left-8 md:top-8">
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </p>

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-6 top-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-cream backdrop-blur-sm transition-colors hover:bg-white/25 md:right-8 md:top-8"
            data-cursor="link"
          >
            <X size={18} strokeWidth={1.75} />
          </button>

          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-charcoal transition-transform hover:scale-105 md:left-10 md:h-12 md:w-12"
            data-cursor="link"
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-charcoal transition-transform hover:scale-105 md:right-10 md:h-12 md:w-12"
            data-cursor="link"
          >
            <ArrowRight size={18} strokeWidth={2} />
          </button>

          {/* Carousel stage — center video, prev/next peeking close on the sides */}
          <div className="relative flex w-full flex-1 items-center justify-center gap-2 overflow-hidden md:gap-3">
            {prevItem?.poster && (
              <button
                key={`prev-${prevItem.src}`}
                onClick={goPrev}
                aria-label="Previous video"
                data-cursor="link"
                className="relative hidden h-[60vh] shrink-0 overflow-hidden rounded-2xl opacity-40 blur-[1px] transition-all duration-300 hover:opacity-60 md:block md:h-[68vh] aspect-[9/16]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={prevItem.poster} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/15 text-cream backdrop-blur-sm">
                  <VolumeX size={14} strokeWidth={1.75} />
                </span>
              </button>
            )}

            <motion.div
              key={current.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className="group relative z-10 h-[70vh] aspect-[9/16] overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:h-[80vh]"
            >
              <video
                ref={videoRef}
                src={current.src}
                poster={current.poster}
                loop
                playsInline
                onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                data-cursor="link"
              >
                {muted ? <VolumeX size={16} strokeWidth={1.75} /> : <Volume2 size={16} strokeWidth={1.75} />}
              </button>
            </motion.div>

            {nextItem?.poster && (
              <button
                key={`next-${nextItem.src}`}
                onClick={goNext}
                aria-label="Next video"
                data-cursor="link"
                className="relative hidden h-[60vh] shrink-0 overflow-hidden rounded-2xl opacity-40 blur-[1px] transition-all duration-300 hover:opacity-60 md:block md:h-[68vh] aspect-[9/16]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={nextItem.poster} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/15 text-cream backdrop-blur-sm">
                  <VolumeX size={14} strokeWidth={1.75} />
                </span>
              </button>
            )}
          </div>

          {/* Caption */}
          <div className="pb-8 text-center text-cream md:pb-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">{current.tag}</p>
            <h3 className="mt-2 text-2xl font-display italic md:text-3xl">{current.title}</h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
