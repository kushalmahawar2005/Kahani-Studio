"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence>
      {current && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[10001] bg-black/95 backdrop-blur-sm flex flex-col"
        >
          {/* Top bar */}
          <div className="flex justify-between items-center px-6 md:px-12 py-6 text-cream">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">
                {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-xs uppercase tracking-widest">{current.tag}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[10px] font-bold uppercase tracking-[0.4em] hover:italic"
              data-cursor="link"
            >
              Close ✕
            </button>
          </div>

          {/* Video stage */}
          <div className="flex-1 flex items-center justify-center px-4 md:px-20 relative">
            <button
              onClick={() => onNav((index - 1 + items.length) % items.length)}
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-cream text-3xl hover:opacity-50 transition-opacity z-10"
              data-cursor="link"
              aria-label="Previous"
            >
              ←
            </button>

            <motion.div
              key={current.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
              className="relative h-full max-h-[80vh] aspect-[9/16]"
            >
              <video
                ref={videoRef}
                src={current.src}
                poster={current.poster}
                loop
                playsInline
                onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-cream"
                data-cursor="link"
              >
                <span className="text-sm">{muted ? "🔇" : "🔊"}</span>
              </button>
            </motion.div>

            <button
              onClick={() => onNav((index + 1) % items.length)}
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-cream text-3xl hover:opacity-50 transition-opacity z-10"
              data-cursor="link"
              aria-label="Next"
            >
              →
            </button>
          </div>

          {/* Bottom caption */}
          <div className="px-6 md:px-12 py-6 flex justify-between items-end text-cream">
            <div>
              <h3 className="text-2xl md:text-4xl font-display italic">{current.title}</h3>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
