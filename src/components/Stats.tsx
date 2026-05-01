"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Reveal from "./Reveal";

const stats = [
  { num: 8, suffix: "", label: "Years of craft" },
  { num: 240, suffix: "+", label: "Stories told" },
  { num: 14, suffix: "", label: "Countries traveled" },
  { num: 86, suffix: "K", label: "Frames archived" },
];

export default function Stats() {
  return (
    <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 bg-charcoal text-cream">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 md:mb-20 items-end">
            <div className="md:col-span-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-cream/50 block mb-6">
                In numbers
              </span>
              <h3 className="text-3xl sm:text-4xl md:text-6xl font-display tracking-tight">
                A <span className="italic">decade</span> in the making.
              </h3>
            </div>
            <p className="md:col-span-6 text-sm leading-relaxed text-cream/60 max-w-md md:ml-auto">
              Numbers don&rsquo;t tell stories — but ours hint at the years, the
              miles, and the early mornings poured into the craft.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-16 md:gap-y-0 md:gap-px md:bg-cream/10">
          {stats.map((s, i) => (
            <Stat key={s.label} {...s} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({
  num,
  suffix,
  label,
  delay,
}: {
  num: number;
  suffix: string;
  label: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const duration = 1800;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(num * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, num]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.19, 1, 0.22, 1] }}
      className="md:bg-charcoal md:p-10"
    >
      <p className="text-5xl sm:text-6xl md:text-7xl font-display tracking-tight tabular-nums">
        {val}
        <span className="text-cream/60">{suffix}</span>
      </p>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-cream/50">
        {label}
      </p>
    </motion.div>
  );
}
