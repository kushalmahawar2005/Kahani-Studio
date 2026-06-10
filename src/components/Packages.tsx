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
    price: "Starting ₹50,000",
    duration: "1 day · solo cinematographer",
    bullets: [
      "Candid Photography Coverage",
      "Traditional Photo & Video",
      "3–5 Minute Highlight Film",
      "Professionally Edited Images",
      "4 Week Delivery",
    ],
    addOn: { label: "Add 1-Day Pre-Wedding Experience", price: "+ ₹30,000" },
  },
  {
    name: "Giriraj Ji ⛰️",
    tag: "Most chosen",
    featured: true,
    img: "/r1.jpg",
    price: "Starting ₹95,000",
    duration: "2 days · 2-person crew",
    bullets: [
      "Complete Wedding Coverage",
      "Candid Photography",
      "Traditional Photo & Video",
      "Cinematic Videography",
      "Drone Coverage",
      "Bride & Groom Storytelling Reels",
      "Priority Delivery",
    ],
    addOn: { label: "Add 2-Day Pre-Wedding Experience", price: "+ ₹60,000" },
    perks: ["🎟️ Complimentary Couple Entry Passes for Vrindavan Visit"],
  },
  {
    name: "Vrindavan ❤️",
    tag: "Grand multi-day weddings",
    img: "/r3.jpg",
    price: "Starting ₹1,61,000",
    duration: "3+ days · full crew",
    bullets: [
      "Multi-Day Wedding Documentation",
      "Candid Photography",
      "Traditional Photo & Video",
      "Cinematic Videography",
      "Drone Coverage",
      "Wedding Story Coverage",
      "Premium Album",
      "Same-Day Wedding Teaser",
      "Priority Delivery",
    ],
    addOn: { label: "Add 3-Day Pre-Wedding Experience", price: "+ ₹85,000" },
    perks: [
      "🎟️ Complimentary Couple Entry Passes for Vrindavan Visit",
      "📸 Priority Photo Preview Within 72 Hours",
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

        <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar -mx-3 px-3 py-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:py-0">
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
              className={`group relative flex flex-col overflow-hidden shrink-0 w-[82%] sm:w-[55%] md:w-auto snap-center ${
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

                {t.addOn && (
                  <div
                    className={`mb-6 flex items-baseline justify-between gap-4 border-t pt-5 ${
                      t.featured ? "border-cream/15" : "border-charcoal/10"
                    }`}
                  >
                    <span
                      className={`text-[11px] leading-snug ${
                        t.featured ? "text-cream/70" : "text-zinc-500"
                      }`}
                    >
                      🏞️ {t.addOn.label}
                    </span>
                    <span
                      className={`shrink-0 text-sm font-display italic ${
                        t.featured ? "text-cream" : "text-charcoal"
                      }`}
                    >
                      {t.addOn.price}
                    </span>
                  </div>
                )}

                {t.perks && (
                  <div className="mb-6">
                    <p
                      className={`text-[10px] font-bold uppercase tracking-[0.4em] mb-3 ${
                        t.featured ? "text-gold" : "text-gold"
                      }`}
                    >
                      ✨ Exclusive Benefits
                    </p>
                    <ul className="space-y-2">
                      {t.perks.map((p) => (
                        <li
                          key={p}
                          className={`text-[11px] leading-snug ${
                            t.featured ? "text-cream/80" : "text-zinc-600"
                          }`}
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

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
