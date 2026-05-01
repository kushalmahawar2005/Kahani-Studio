"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 30, stiffness: 400, mass: 0.5 });
  const sy = useSpring(y, { damping: 30, stiffness: 400, mass: 0.5 });

  const [variant, setVariant] = useState<"default" | "view" | "link">("default");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(isFine);
    if (!isFine) return;

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    const over = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-cursor='view']")) setVariant("view");
      else if (t.closest("a, button, [data-cursor='link']")) setVariant("link");
      else setVariant("default");
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!enabled || variant !== "view") return null;

  const size = 84;
  const label = "VIEW";

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{ x: sx, y: sy }}
      >
        <motion.div
          animate={{ width: size, height: size }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center border border-charcoal/5"
        >
          {label && (
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-black">
              {label}
            </span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
