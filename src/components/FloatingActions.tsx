"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Right side floating actions (Back to top) */}
      <div className="fixed bottom-4 right-3 sm:bottom-5 sm:right-5 md:bottom-8 md:right-8 z-[55] flex flex-col items-end gap-2 sm:gap-3">
        <AnimatePresence>
          {showTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 20 }}
              transition={{ duration: 0.4, ease: [0.19, 1, 0.22, 1] }}
              onClick={scrollTop}
              aria-label="Back to top"
              className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-charcoal text-cream flex items-center justify-center shadow-lg hover:bg-charcoal/85 transition-colors"
              data-cursor="link"
            >
              <span className="text-base sm:text-xl">↑</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Left side floating actions (Query Form & WhatsApp) */}
      <div className="fixed bottom-4 left-3 sm:bottom-5 sm:left-5 md:bottom-8 md:left-8 z-[55] flex flex-col items-start gap-3 sm:gap-4">
        {/* Query Form pulse button */}
        <motion.a
          href="#contact"
          aria-label="Query Form"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.8, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative group"
          data-cursor="link"
        >
          <span className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-charcoal text-cream flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7 fill-current" aria-hidden>
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
          </span>
          <span className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-charcoal text-cream text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Query Form
          </span>
        </motion.a>

        {/* WhatsApp pulse button */}
        <motion.a
          href="https://wa.me/919610240176?text=Hi%20Kahani%20Clicks%2C%20I%27d%20like%20to%20inquire%20about%20a%20booking."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative group"
          data-cursor="link"
        >
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          <span className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 32 32" className="w-7 h-7 md:w-8 md:h-8 fill-current" aria-hidden>
              <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035 1.058 2.722 1.058.717 0 2.15-.473 2.45-1.247.13-.345.187-.71.187-1.075 0-.215-.043-.43-.115-.616-.7-.215-1.146-.788-1.602-.96-.142-.043-.285-.043-.428-.043z" />
              <path d="M16.005 32C13.27 32 10.6 31.272 8.27 29.872l-.502-.302L1.39 31.305l1.808-6.21-.358-.515c-1.47-2.357-2.27-5.114-2.272-7.87C.57 7.483 7.654.5 16.05.5 24.448.5 32 7.482 32 16.054 32 24.625 24.448 32 16.005 32zm0-29.5C8.96 2.5 2.57 8.86 2.57 16.71c0 2.43.7 4.84 2.012 6.916l.317.502-1.073 3.69 3.78-1.045.487.287c2.03 1.205 4.354 1.84 6.93 1.84 7.043 0 12.74-6.36 12.74-13.81S23.05 2.5 16.005 2.5z" />
            </svg>
          </span>
          <span className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-[0.3em] px-3 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Chat with us
          </span>
        </motion.a>
      </div>
    </>
  );
}
