"use client";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const stories = [
  { src: "/1000928369.jpg", caption: "Vasundhara × Aryan", place: "Udaipur · MMXXVI" },
  { src: "/1000851634.jpg", caption: "The Royal Affair", place: "Jaipur · MMXXVI" },
  { src: "/1000928359.jpg", caption: "Mehendi Whispers", place: "Jodhpur · MMXXV" },
  { src: "/1000407545.jpg", caption: "Eternal Vows", place: "Bikaner · MMXXVI" },
];

export default function EditorialSplit() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section ref={ref} className="relative py-12 md:py-20 px-3 md:px-6 bg-[#F9F9EA]">
      <div className="mx-auto max-w-[1800px] grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {stories.map((s, i) => {
          const offset = i % 2 === 0 ? y1 : y2;
          return (
            <motion.div
              key={s.src}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="relative aspect-[3/4] overflow-hidden group bg-zinc-100"
              data-cursor="view"
            >
              <motion.div style={{ y: offset }} className="absolute -inset-[5%]">
                <Image
                  src={s.src}
                  alt={s.caption}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                />
              </motion.div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-cream">
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] opacity-70">
                  {s.place}
                </p>
                <h3 className="mt-2 text-base md:text-2xl font-display italic">
                  {s.caption}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
