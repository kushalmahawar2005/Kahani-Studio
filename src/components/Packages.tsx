"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";

const tiers = [
  {
    name: "Barsana 🌸",
    tag: "Intimate ceremonies",
    img: "/r2.jpg",
    price: "Custom Quote",
    duration: "1 day · solo cinematographer",
    bullets: [
      "Candid Photography Coverage",
      "3–5 Minute Highlight Film",
      "Traditional Ceremony Documentation",
      "Professionally Color Graded Images",
      "Online Gallery Access",
      "4 Week Delivery",
    ],
  },
  {
    name: "Giriraj Ji ⛰️",
    tag: "Most chosen",
    featured: true,
    img: "/r1.jpg",
    price: "Custom Quote",
    duration: "2 days · 2-person crew",
    bullets: [
      "Complete Wedding Coverage",
      "8–10 Minute Cinematic Film",
      "Pre-Wedding Portrait Session",
      "Bride & Groom Storytelling Reels",
      "Drone Coverage",
      "Premium Album Design",
      "Priority Delivery",
    ],
  },
  {
    name: "Vrindavan ❤️",
    tag: "Grand multi-day weddings",
    img: "/r3.jpg",
    price: "Custom Quote",
    duration: "3+ days · full crew",
    bullets: [
      "Multi-Day Wedding Documentation",
      "Documentary Style Coverage",
      "Feature-Length Wedding Film",
      "Drone & Luxury Cinematography",
      "Premium Wedding Album",
      "Same-Day Wedding Teaser",
      "Destination Wedding Coverage",
      "Worldwide Travel Available",
    ],
  },
];

export default function Packages() {
  return (
    <section id="invest" className="py-16 sm:py-24 md:py-40 px-3 sm:px-6 md:px-12 bg-[#F9F9EA]">
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <div className="text-center mb-16 md:mb-24">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6">
              Investment
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-7xl font-display tracking-tight">
              Choose the chapter of your <span className="italic">wedding story.</span>
            </h3>
            <p className="mt-6 mx-auto max-w-xl text-sm text-zinc-500 italic">
              Every wedding is unique. Our collections are thoughtfully designed to preserve every emotion, ritual, and memory with timeless elegance.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 1,
                delay: i * 0.12,
                ease: [0.19, 1, 0.22, 1],
              }}
              className={`group relative flex flex-col overflow-hidden ${
                t.featured
                  ? "bg-charcoal text-cream"
                  : "bg-[#fdfcf0] border border-charcoal/10"
              }`}
            >
              {t.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.4em] bg-gold text-charcoal"
                >
                  Most chosen
                </span>
              )}

              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <Image
                  src={t.img}
                  alt={t.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                />
                <div
                  className={`absolute inset-0 ${
                    t.featured
                      ? "bg-gradient-to-t from-charcoal via-charcoal/30 to-transparent"
                      : "bg-gradient-to-t from-[#fdfcf0] via-[#fdfcf0]/20 to-transparent"
                  }`}
                />
              </div>

              <div className="relative flex flex-1 flex-col p-8 md:p-10 -mt-px">
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.5em] mb-4 ${
                  t.featured ? "text-cream/60" : "text-zinc-400"
                }`}
              >
                {t.tag}
              </span>
              <h4 className="text-4xl sm:text-5xl md:text-5xl font-display tracking-tight mb-2">
                {t.name}
              </h4>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.3em] ${
                  t.featured ? "text-cream/60" : "text-zinc-400"
                }`}
              >
                {t.duration}
              </p>

              <div
                className={`my-8 h-[1px] ${
                  t.featured ? "bg-cream/15" : "bg-charcoal/10"
                }`}
              />

              <ul className="space-y-3 flex-1">
                {t.bullets.map((b) => (
                  <li
                    key={b}
                    className={`text-sm leading-relaxed flex gap-3 ${
                      t.featured ? "text-cream/80" : "text-zinc-600"
                    }`}
                  >
                    <span
                      className={`mt-2 h-[1px] w-3 shrink-0 ${
                        t.featured ? "bg-cream/40" : "bg-charcoal/30"
                      }`}
                    />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-4 ${
                    t.featured ? "text-cream/60" : "text-zinc-400"
                  }`}
                >
                  Investment
                </p>
                <p
                  className={`text-2xl font-display italic mb-6 ${
                    t.featured ? "text-cream" : "text-charcoal"
                  }`}
                >
                  {t.price}
                </p>
                <Magnetic>
                  <a
                    href="#contact"
                    className={`group inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.4em] ${
                      t.featured ? "text-cream" : "text-charcoal"
                    }`}
                    data-cursor="link"
                  >
                    Inquire
                    <span className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                </Magnetic>
              </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
