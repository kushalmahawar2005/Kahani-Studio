"use client";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";

const tiers = [
  {
    name: "Essence",
    tag: "Intimate ceremonies",
    price: "On request",
    duration: "1 day · 1 cinematographer",
    bullets: [
      "Editorial photography (300+ frames)",
      "3-min highlight film",
      "Hand-graded color, classical scoring",
      "Online gallery, 4-week delivery",
    ],
  },
  {
    name: "Heirloom",
    tag: "Most chosen",
    featured: true,
    price: "On request",
    duration: "2 days · 2-person crew",
    bullets: [
      "Full editorial coverage",
      "8-min cinematic feature",
      "Pre-wedding portrait session",
      "Custom heirloom album draft",
      "8-week delivery, archival masters",
    ],
  },
  {
    name: "Magnum",
    tag: "Multi-day weddings",
    price: "On request",
    duration: "3+ days · full crew",
    bullets: [
      "Documentary across all events",
      "Feature-length film (20–30 min)",
      "Drone & cinema-glass coverage",
      "Bespoke leather album, signed prints",
      "12-week delivery, world-anywhere travel",
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
              Three ways to <span className="italic">begin.</span>
            </h3>
            <p className="mt-6 mx-auto max-w-xl text-sm text-zinc-500 italic">
              Every collection is bespoke — these are starting points, not ceilings.
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
              className={`relative p-8 md:p-10 flex flex-col ${
                t.featured
                  ? "bg-charcoal text-cream"
                  : "bg-[#fdfcf0] border border-charcoal/10"
              }`}
            >
              {t.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.4em] bg-gold text-charcoal"
                >
                  Most chosen
                </span>
              )}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
