"use client";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";

const functions = [
  {
    name: "Phoolon Ki Holi",
    emoji: "🌼",
    sub: "Haldi Choreography Package",
    price: "Starting ₹5,000",
    bullets: [
      "2 Group Dances",
      "Family Performance",
      "Song Editing & Mixing",
      "Practice Sessions",
    ],
  },
  {
    name: "Nikunj",
    emoji: "🌸",
    sub: "Mehndi Choreography Package",
    price: "Starting ₹6,000",
    bullets: [
      "Bride Entry Dance",
      "Family Dances",
      "Song Selection Support",
      "Practice Sessions",
    ],
  },
  {
    name: "Tilak Mahotsav",
    emoji: "💍",
    sub: "Engagement Choreography Package",
    price: "Starting ₹7,000",
    bullets: [
      "Couple Dance",
      "Family Dance",
      "Ring Ceremony Entry",
      "Song Editing",
    ],
  },
  {
    name: "Mayra Mahotsav",
    emoji: "🎁",
    sub: "Mayra Choreography Package",
    price: "Starting ₹5,000",
    bullets: [
      "Traditional Family Dance",
      "Group Performances",
      "Song Mixing",
      "Practice Sessions",
    ],
  },
  {
    name: "Raas",
    emoji: "🎶",
    sub: "Sangeet Choreography Package",
    price: "Starting ₹12,000",
    popular: true,
    bullets: [
      "Couple Dance",
      "3 Group Dances",
      "Family Performances",
      "Complete Song Mixing",
      "Performance Planning",
    ],
  },
  {
    name: "Milan",
    emoji: "❤️",
    sub: "Wedding Day Choreography Package",
    price: "Starting ₹10,000",
    bullets: [
      "Bride Entry Dance",
      "Groom Entry Dance",
      "Couple Performance",
      "Family Special Dance",
      "Event Coordination",
    ],
  },
];

const complete = [
  {
    name: "Braj Mahotsav",
    emoji: "🌸",
    sub: "Complete Wedding Choreography Package",
    price: "Starting ₹30,000",
    bullets: [
      "Phoolon Ki Holi (Haldi)",
      "Nikunj (Mehndi)",
      "Tilak Mahotsav (Engagement)",
      "Mayra Mahotsav",
      "Raas (Sangeet)",
      "Milan (Wedding Day)",
      "Unlimited Song Mixing",
      "Multiple Practice Sessions",
    ],
  },
  {
    name: "Maharas",
    emoji: "👑",
    sub: "Royal Wedding Choreography Package",
    price: "Starting ₹50,000",
    featured: true,
    bullets: [
      "All Functions Included",
      "Unlimited Dance Performances",
      "Premium Song Editing & Mixing",
      "Entry Concepts & Planning",
      "Stage Performance Direction",
      "Dedicated Choreographer Team",
      "Unlimited Practice Sessions",
      "Event Day Coordination",
    ],
  },
];

export default function Choreography() {
  return (
    <section
      id="choreography"
      className="py-16 sm:py-24 md:py-40 px-3 sm:px-6 md:px-12 bg-[#fdfcf0]"
    >
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <div className="text-center mb-16 md:mb-24">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6">
              Wedding Choreography
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-7xl font-display tracking-tight">
              Dance every ritual into a <span className="italic">memory.</span>
            </h3>
            <p className="mt-6 mx-auto max-w-xl text-sm text-zinc-500 italic">
              From Haldi to Wedding Day — a complete Braj-inspired choreography
              experience. 🌸🦚💃
            </p>
            <Magnetic>
              <a
                href="https://www.instagram.com/happy.heelss?igsh=MXczczJmbXJnNDVhYg=="
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal"
                data-cursor="link"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
                @happy.heelss
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Magnetic>
          </div>
        </Reveal>

        {/* Single-function packages */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:gap-8">
          {functions.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.9,
                delay: (i % 3) * 0.1,
                ease: [0.19, 1, 0.22, 1],
              }}
              className="group relative flex flex-col bg-[#F9F9EA] border border-charcoal/10 p-3 sm:p-6 md:p-10"
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-1 sm:px-4 sm:py-1.5 rounded-full text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.4em] bg-gold text-charcoal">
                  Most Popular
                </span>
              )}
              <span className="text-2xl sm:text-3xl mb-2 sm:mb-4">{p.emoji}</span>
              <h4 className="text-base sm:text-2xl md:text-4xl font-display tracking-tight mb-1 sm:mb-2 leading-tight">
                {p.name}
              </h4>
              <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.3em] text-zinc-400 leading-tight">
                {p.sub}
              </p>

              <div className="my-3 sm:my-7 h-[1px] bg-charcoal/10" />

              <ul className="space-y-1.5 sm:space-y-3 flex-1">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className="text-[11px] sm:text-sm leading-snug sm:leading-relaxed flex gap-1.5 sm:gap-3 text-zinc-600"
                  >
                    <span className="mt-1.5 sm:mt-2 h-[1px] w-2 sm:w-3 shrink-0 bg-charcoal/30" />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-4 sm:mt-8 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p className="text-base sm:text-xl font-display italic text-charcoal">
                  {p.price}
                </p>
                <Magnetic>
                  <a
                    href="#contact"
                    className="group inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-charcoal"
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

        {/* Complete packages */}
        <div className="mt-8 sm:mt-16 md:mt-20 grid grid-cols-2 gap-2 sm:gap-6 md:gap-8">
          {complete.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 1,
                delay: i * 0.12,
                ease: [0.19, 1, 0.22, 1],
              }}
              className={`group relative flex flex-col overflow-hidden p-3 sm:p-8 md:p-12 ${
                p.featured
                  ? "bg-charcoal text-cream"
                  : "bg-[#F9F9EA] border border-charcoal/10"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap px-2 py-1 sm:px-4 sm:py-1.5 rounded-full text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.4em] bg-gold text-charcoal">
                  Royal Experience
                </span>
              )}
              <span className="text-2xl sm:text-4xl mb-2 sm:mb-4">{p.emoji}</span>
              <h4 className="text-lg sm:text-4xl md:text-5xl font-display tracking-tight mb-1 sm:mb-2 leading-tight">
                {p.name}
              </h4>
              <p
                className={`text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.3em] leading-tight ${
                  p.featured ? "text-cream/60" : "text-zinc-400"
                }`}
              >
                {p.sub}
              </p>

              <div
                className={`my-3 sm:my-7 h-[1px] ${
                  p.featured ? "bg-cream/15" : "bg-charcoal/10"
                }`}
              />

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 sm:gap-y-3 flex-1">
                {p.bullets.map((b) => (
                  <li
                    key={b}
                    className={`text-[11px] sm:text-sm leading-snug sm:leading-relaxed flex gap-1.5 sm:gap-3 ${
                      p.featured ? "text-cream/80" : "text-zinc-600"
                    }`}
                  >
                    <span
                      className={`mt-1.5 sm:mt-2 h-[1px] w-2 sm:w-3 shrink-0 ${
                        p.featured ? "bg-cream/40" : "bg-charcoal/30"
                      }`}
                    />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-4 sm:mt-10 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p
                  className={`text-base sm:text-2xl font-display italic ${
                    p.featured ? "text-cream" : "text-charcoal"
                  }`}
                >
                  {p.price}
                </p>
                <Magnetic>
                  <a
                    href="#contact"
                    className={`group inline-flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] ${
                      p.featured ? "text-cream" : "text-charcoal"
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
