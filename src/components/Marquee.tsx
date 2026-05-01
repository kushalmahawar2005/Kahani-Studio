"use client";
import { motion } from "framer-motion";

export default function Marquee({
  items,
  duration = 40,
  reverse = false,
}: {
  items: string[];
  duration?: number;
  reverse?: boolean;
}) {
  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden whitespace-nowrap py-8 border-y border-charcoal/10 bg-[#F9F9EA] relative">
      <motion.div
        className="flex"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {loop.map((item, i) => (
          <span
            key={i}
            className="mx-6 sm:mx-12 text-3xl sm:text-5xl md:text-7xl font-display italic text-charcoal/80 flex items-center gap-6 sm:gap-12"
          >
            {item}
            <span className="inline-block w-3 h-3 rounded-full bg-gold align-middle" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}
