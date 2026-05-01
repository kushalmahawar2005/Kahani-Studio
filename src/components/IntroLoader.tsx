"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const SESSION_KEY = "kc-intro-seen";
const DURATION_MS = 2600;

export default function IntroLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* sessionStorage may be unavailable (privacy mode) — show as a fallback */
    }
    if (seen) return;

    setShow(true);
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      setShow(false);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      document.body.style.overflow = "";
    }, DURATION_MS);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[10000] bg-[#F9F9EA] flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Image
                src="/chakra.png"
                alt=""
                width={80}
                height={80}
                className="opacity-60 mix-blend-multiply"
              />
            </motion.div>
            <div className="mt-8 overflow-hidden">
              <motion.p
                initial={{ y: 30 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.4, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-500"
              >
                Kahani Clicks · Est. MMXXIV
              </motion.p>
            </div>
            <div className="mt-12 h-[1px] w-40 bg-charcoal/20 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ delay: 0.6, duration: 1.6, ease: [0.76, 0, 0.24, 1] }}
                className="h-full w-full bg-charcoal"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
