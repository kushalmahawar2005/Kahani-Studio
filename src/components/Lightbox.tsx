"use client";
import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type Item = { src: string; title: string; category: string; year: string };

export default function Lightbox({
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
              <p className="mt-2 text-xs uppercase tracking-widest">{current.category}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[10px] font-bold uppercase tracking-[0.4em] hover:italic"
              data-cursor="link"
            >
              Close ✕
            </button>
          </div>

          {/* Image stage */}
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
              className="relative w-full h-full max-w-[1400px] max-h-[80vh]"
            >
              <Image
                src={current.src}
                alt={current.title}
                fill
                className="object-contain"
                priority
                sizes="100vw"
              />
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
            <p className="text-[10px] font-bold tracking-[0.4em] opacity-60">{current.year}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
