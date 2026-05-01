"use client";
import { motion } from "framer-motion";
import Magnetic from "./Magnetic";

export default function UrgencyStrip() {
  return (
    <section className="px-3 md:px-6 -mt-px">
      <div className="mx-auto max-w-[1800px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 px-6 md:px-10 py-6 md:py-8 bg-charcoal text-cream"
        >
          <div className="flex items-center gap-3 md:gap-4">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
            </span>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">
              Now booking — only 4 dates left for 2026
            </p>
          </div>
          <Magnetic>
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] underline underline-offset-8"
              data-cursor="link"
            >
              Reserve your date
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
