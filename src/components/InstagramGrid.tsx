"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";

const feed = [
  "/CA9A0451.JPG",
  "/CA9A1588.JPG",
  "/CA9A2039.JPG",
  "/CA9A2577.JPG",
  "/CA9A9580.JPG",
  "/CA9A9996.JPG",
];

export default function InstagramGrid() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#F9F9EA] border-t border-charcoal/5">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-12 md:mb-16 gap-6">
          <Reveal>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
                The Daily
              </span>
              <h3 className="mt-3 text-2xl sm:text-4xl md:text-6xl font-display tracking-tight italic">
                @kahani_click
              </h3>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Magnetic>
              <a
                href="https://www.instagram.com/kahani_click?utm_source=qr&igsh=MmY0eG51NHppbmZj"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em]"
                data-cursor="link"
              >
                Follow on Instagram
                <span className="transition-transform group-hover:translate-x-1">↗</span>
              </a>
            </Magnetic>
          </Reveal>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1">
          {feed.map((src, i) => (
            <motion.a
              key={src}
              href="https://www.instagram.com/kahani_click?utm_source=qr&igsh=MmY0eG51NHppbmZj"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.9,
                delay: i * 0.08,
                ease: [0.19, 1, 0.22, 1],
              }}
              className="relative aspect-square overflow-hidden bg-zinc-200 group"
              data-cursor="view"
            >
              <Image
                src={src}
                alt="Instagram post"
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-500 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-cream text-2xl">
                  ↗
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
