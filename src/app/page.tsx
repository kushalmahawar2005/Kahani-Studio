"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/Reveal";
import Marquee from "@/components/Marquee";
import Lightbox from "@/components/Lightbox";
import Magnetic from "@/components/Magnetic";
import ContactForm from "@/components/ContactForm";
import AboutSection from "@/components/AboutSection";
import Showreel from "@/components/Showreel";
import Packages from "@/components/Packages";
import ScrollStack, { ScrollStackImageCard } from "@/components/ScrollStack";
import Stats from "@/components/Stats";
import InstagramGrid from "@/components/InstagramGrid";
import EditorialSplit from "@/components/EditorialSplit";
import FullBleed from "@/components/FullBleed";
import UrgencyStrip from "@/components/UrgencyStrip";
import Newsletter from "@/components/Newsletter";
import LegacySection from "@/components/LegacySection";
import Logo from "@/components/Logo";

const galleryImages = [
  { src: "/1000407545.jpg", title: "Eternal Vows", category: "Wedding", year: "MMXXVI", span: "tall" },
  { src: "/1000407549.jpg", title: "First Look", category: "Wedding", year: "MMXXVI", span: "wide" },
  { src: "/1000519122.jpg", title: "Golden Hour", category: "Portrait", year: "MMXXVI", span: "square" },
  { src: "/1000519168.jpg", title: "Cinematic Still", category: "Film", year: "MMXXV", span: "tall" },
  { src: "/1000851634.jpg", title: "The Royal Entrance", category: "Event", year: "MMXXVI", span: "square" },
  { src: "/1000851638.jpg", title: "Sacred Moments", category: "Ritual", year: "MMXXV", span: "wide" },
  { src: "/1000851652.jpg", title: "Desert Dreams", category: "Pre-Wedding", year: "MMXXVI", span: "tall" },
  { src: "/1000927051.jpg", title: "Mehendi Whispers", category: "Ceremony", year: "MMXXVI", span: "square" },
  { src: "/1000928359.jpg", title: "Joy, Captured", category: "Candid", year: "MMXXVI", span: "square" },
  { src: "/1000928374.jpg", title: "Heritage", category: "Architecture", year: "MMXXV", span: "wide" },
  { src: "/1000928376.jpg", title: "The Embrace", category: "Wedding", year: "MMXXVI", span: "square" },
  { src: "/CA9A1701.JPG", title: "Quiet Light", category: "Editorial", year: "MMXXV", span: "tall" },
  { src: "/CA9A0451.JPG", title: "Bridal Gaze", category: "Portrait", year: "MMXXVI", span: "tall" },
  { src: "/CA9A1518.JPG", title: "Henna Hour", category: "Ceremony", year: "MMXXVI", span: "square" },
  { src: "/CA9A1588.JPG", title: "The Promise", category: "Wedding", year: "MMXXVI", span: "wide" },
  { src: "/CA9A1701.JPG", title: "Whispered Vows", category: "Candid", year: "MMXXVI", span: "tall" },
  { src: "/CA9A1703.JPG", title: "Tender Light", category: "Portrait", year: "MMXXVI", span: "square" },
  { src: "/CA9A2039.JPG", title: "Crown of Marigolds", category: "Ritual", year: "MMXXVI", span: "wide" },
  { src: "/CA9A2048.JPG", title: "Sacred Threads", category: "Ceremony", year: "MMXXVI", span: "tall" },
  { src: "/CA9A2577.JPG", title: "Twilight Embrace", category: "Pre-Wedding", year: "MMXXVI", span: "square" },
  { src: "/CA9A2580.JPG", title: "Heirloom Hands", category: "Detail", year: "MMXXVI", span: "tall" },
  { src: "/CA9A3213.JPG", title: "Stillness", category: "Editorial", year: "MMXXVI", span: "wide" },
  { src: "/CA9A9580.JPG", title: "First Light", category: "Portrait", year: "MMXXVI", span: "square" },
  { src: "/CA9A9689.JPG", title: "Procession", category: "Event", year: "MMXXVI", span: "tall" },
  { src: "/CA9A9700.jpg", title: "Soft Reverie", category: "Candid", year: "MMXXVI", span: "square" },
  { src: "/CA9A9996.JPG", title: "Velvet Dusk", category: "Wedding", year: "MMXXVI", span: "wide" },
  { src: "/_MVS2232.JPG", title: "Heirloom", category: "Editorial", year: "MMXXVI", span: "tall" },
  { src: "/b28f26484d0520cb6be6381f8ddd091c.jpg", title: "The Stage", category: "Decor", year: "MMXXVI", span: "wide" },
  { src: "/CA9A3856.JPG", title: "Golden Hour", category: "Portrait", year: "MMXXVI", span: "tall" },
  { src: "/1000927051.jpg", title: "Festive Joy", category: "Ceremony", year: "MMXXVI", span: "square" },
  { src: "/CA9A9700.jpg", title: "Soft Reverie", category: "Candid", year: "MMXXVI", span: "tall" },
  { src: "/1000928369.jpg", title: "The Ritual", category: "Ritual", year: "MMXXVI", span: "tall" },
];

const testimonials = [
  {
    quote: "Pure poetry. They preserved the soul of every glance.",
    author: "Aanya & Vikram",
    location: "Udaipur, 2026",
    img: "/1000407545.jpg",
  },
  {
    quote: "Cinematic, intimate, fearless.",
    author: "Riya & Arjun",
    location: "Jaipur, 2025",
    img: "/1000928369.jpg",
  },
  {
    quote: "Every frame is a painting.",
    author: "Meera & Karan",
    location: "Jodhpur, 2024",
    img: "/1000851634.jpg",
  },
];

const journey = [
  { num: "01", title: "Discovery", desc: "A conversation. We learn your story, vision, and the texture of your day." },
  { num: "02", title: "Direction", desc: "Mood-boards, location scouts, shot lists curated like a film script." },
  { num: "03", title: "Document", desc: "We disappear into the day, capturing it as cinema — never staged, always seen." },
  { num: "04", title: "Deliver", desc: "Editorial galleries and feature-length films, hand-graded over weeks." },
];

export default function Home() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);



  const legacyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: legacyProgress } = useScroll({
    target: legacyRef,
    offset: ["start end", "end start"],
  });
  const legacyY = useTransform(legacyProgress, [0, 1], ["-15%", "15%"]);
  const legacyTextY = useTransform(legacyProgress, [0, 1], ["20%", "-20%"]);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [menuOpen]);

  return (
    <main className="relative bg-[#F9F9EA] text-[#1a1a1a] selection:bg-charcoal selection:text-cream overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full glass-light px-6 py-5 md:px-12 md:py-6">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between">
          <a href="#top" className="flex items-center" data-cursor="link">
            <Logo iconSize={32} />
          </a>
          <div className="hidden space-x-12 text-[10px] font-bold uppercase tracking-[0.4em] md:flex">
            <a href="#work" className="hover:opacity-40 transition-opacity" data-cursor="link">Portfolio</a>
            <a href="#about" className="hover:opacity-40 transition-opacity" data-cursor="link">Philosophy</a>
            <a href="#services" className="hover:opacity-40 transition-opacity" data-cursor="link">Services</a>
            <a href="#contact" className="hover:opacity-40 transition-opacity" data-cursor="link">Inquire</a>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden md:block h-8 w-[1px] bg-charcoal/10" />
            <Magnetic className="hidden md:block">
              <a
                href="#contact"
                className="text-[10px] font-bold uppercase tracking-widest hover:italic transition-all"
                data-cursor="link"
              >
                Establishment
              </a>
            </Magnetic>
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Open menu"
              data-cursor="link"
            >
              <span className="block w-6 h-[1px] bg-charcoal" />
              <span className="block w-6 h-[1px] bg-charcoal" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ x: menuOpen ? 0 : "100%" }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-[60] bg-[#F9F9EA] md:hidden flex flex-col px-6 py-6"
      >
        <div className="flex justify-between items-center">
          <a href="#top" onClick={() => setMenuOpen(false)} className="block">
            <Logo iconSize={28} />
          </a>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-2xl"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-8">
          {[
            { href: "#work", label: "Portfolio" },
            { href: "#about", label: "Philosophy" },
            { href: "#services", label: "Services" },
            { href: "#testimonials", label: "Couples" },
            { href: "#contact", label: "Inquire" },
          ].map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-5xl font-display italic"
            >
              <span className="text-[10px] font-bold tracking-[0.4em] not-italic align-top mr-3 text-zinc-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              {l.label}
            </a>
          ))}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
          Est. MMXXIV · Rajasthan
        </div>
      </motion.div>

      {/* Hero */}
      <section
        id="top"
        className="relative w-full flex flex-col items-center justify-start pt-16 md:pt-20 bg-[#F9F9EA]"
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-charcoal/5 mx-20" />

        <div className="w-full flex flex-col items-center justify-start text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
            className="mb-2 px-4 md:px-6 flex items-center justify-center gap-3 md:gap-8 relative"
            style={{ position: "relative" }}
            suppressHydrationWarning
          >
            <Image
              src="/chakra.png"
              alt=""
              width={120}
              height={120}
              priority
              style={{ width: "auto", height: "auto" }}
              className="opacity-60 w-[12vw] max-w-[48px] md:max-w-[120px]"
            />
            <Image
              src="/tilak_couple.png"
              alt="Kahani Clicks"
              width={800}
              height={500}
              priority
              style={{ width: "auto", height: "auto" }}
              className="mx-auto w-[60vw] sm:w-[50vw] max-w-[800px]"
            />
            <Image
              src="/shankha.png"
              alt=""
              width={120}
              height={120}
              priority
              style={{ width: "auto", height: "auto" }}
              className="opacity-60 w-[12vw] max-w-[48px] md:max-w-[120px]"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 1.6 }}
            className="mt-4 md:mt-6 flex flex-col items-center px-6 relative"
            style={{ position: "relative" }}
            suppressHydrationWarning
          >
            <p className="max-w-sm md:max-w-md text-[9px] sm:text-[10px] md:text-xs leading-relaxed uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-widest text-zinc-500 text-center">
              Capturing the silent symphony of light and life with timeless precision.
            </p>

            <div className="mt-5 md:mt-8 flex flex-col sm:flex-row gap-3 md:gap-4 items-center w-full px-4 sm:px-0 sm:w-auto">
              <Magnetic>
                <a
                  href="#work"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-4 bg-charcoal text-cream rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] w-full sm:w-auto"
                  data-cursor="link"
                >
                  View the work
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="https://wa.me/919610240176?text=Hi%20Kahani%20Clicks%2C%20I%27d%20like%20to%20inquire%20about%20a%20booking."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-4 border border-charcoal/30 hover:border-charcoal rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] transition-colors w-full sm:w-auto"
                  data-cursor="link"
                >
                  WhatsApp inquiry
                  <span className="transition-transform group-hover:translate-x-1">↗</span>
                </a>
              </Magnetic>
            </div>

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 48 }}
              transition={{ delay: 3.6, duration: 1.4, ease: [0.19, 1, 0.22, 1] }}
              className="mt-4 md:mt-6 w-[1px] bg-charcoal relative"
              style={{ position: "relative" }}
              suppressHydrationWarning
            />
            <span className="mt-1 mb-1 text-[9px] font-bold uppercase tracking-[0.5em] text-zinc-400">
              Scroll
            </span>
          </motion.div>

          {/* Hero ScrollStack — cinematic image cards */}
          <ScrollStack>
            <ScrollStackImageCard
              src="/1000407545.jpg"
              title="Eternal Vows"
              subtitle="Wedding · Udaipur"
              index={0}
            />
            <ScrollStackImageCard
              src="/CA9A1703.JPG"
              title="Sacred Moments"
              subtitle="Ritual · Jaipur"
              index={1}
            />
            <ScrollStackImageCard
              src="/1000407549.jpg"
              title="The Embrace"
              subtitle="Candid · Jodhpur"
              index={2}
            />
            <ScrollStackImageCard
              src="/CA9A3856.JPG"
              title="Golden Hour"
              subtitle="Portrait · Bikaner"
              index={3}
            />
          </ScrollStack>
        </div>
      </section>

      {/* Marquee */}
      <div className="mt-20 md:mt-32">
        <Marquee
          items={[
            "Available for 2026",
            "Destination Weddings",
            "Editorial Films",
            "Rajasthan & Beyond",
          ]}
        />
      </div>



      {/* Philosophy — short editorial line + 3-photo strip */}
      <section id="about" className="py-20 md:py-32 px-6 md:px-12 bg-[#F9F9EA] border-y border-charcoal/5">
        <div className="mx-auto max-w-[1800px]">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display leading-[1.15] tracking-tight italic text-center max-w-4xl mx-auto mb-10 sm:mb-16 md:mb-24">
              Light, kept honest. <br />Stories, kept forever.
            </h2>
          </Reveal>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {[
              { src: "/1000407549.jpg", h: "h-[140px] sm:h-[180px] md:h-[420px]" },
              { src: "/1000928374.jpg", h: "h-[180px] sm:h-[240px] md:h-[520px]" },
              { src: "/1000851638.jpg", h: "h-[140px] sm:h-[180px] md:h-[420px]" },
            ].map((p, i) => (
              <motion.div
                key={p.src}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1, delay: i * 0.12, ease: [0.19, 1, 0.22, 1] }}
                className={`relative ${p.h} overflow-hidden`}
              >
                <Image
                  src={p.src}
                  alt=""
                  fill
                  sizes="33vw"
                  className="object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery — bento, full color, work-first */}
      <section id="work" className="py-20 md:py-32 px-3 md:px-6">
        <div className="mx-auto max-w-[1800px]">
          <Reveal>
            <div className="mb-12 md:mb-16 flex flex-col md:flex-row items-baseline justify-between border-b border-charcoal/10 pb-8 px-3 md:px-6 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
                  III . Archive
                </span>
                <h3 className="mt-3 text-4xl sm:text-6xl md:text-8xl font-display tracking-tighter uppercase italic">
                  The Works
                </h3>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest md:text-right text-zinc-400">
                {galleryImages.length} frames · click to view
              </p>
            </div>
          </Reveal>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-1.5 sm:gap-2 md:gap-3 [column-fill:_balance]">
            {galleryImages.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setLightboxIndex(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{
                  duration: 0.9,
                  delay: (i % 4) * 0.06,
                  ease: [0.19, 1, 0.22, 1],
                }}
                className="relative overflow-hidden bg-zinc-100 group cursor-pointer block w-full mb-1.5 sm:mb-2 md:mb-3 break-inside-avoid"
                data-cursor="view"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto block transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 text-cream text-left">
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.3em] opacity-70 block">
                    {img.category}
                  </span>
                  <h4 className="mt-1 text-base md:text-xl font-display italic">
                    {img.title}
                  </h4>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <EditorialSplit />

      <Showreel />

      <FullBleed
        src="/r2.mp4"
        caption="A frame is forever."
        meta="No.IV · Editorial"
      />

      {/* Legacy parallax break */}
      <section
        ref={legacyRef}
        className="relative h-[60vh] sm:h-[80vh] md:h-screen w-full px-3 sm:px-4 md:px-12 py-12 sm:py-20"
      >
        <div className="w-full h-full relative overflow-hidden border border-charcoal/10">
          <motion.div style={{ y: legacyY }} className="absolute -inset-[10%]">
            <Image
              src="/1000928374.jpg"
              alt=""
              fill
              className="object-cover brightness-[0.7]"
              sizes="100vw"
            />
          </motion.div>
          <motion.div
            style={{ y: legacyTextY }}
            className="absolute inset-0 flex flex-col items-center justify-center text-white"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.6em] md:tracking-[0.8em] mb-6">
              IV . The Medium
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-[12rem] font-display font-black tracking-tighter leading-none mix-blend-overlay">
              LEGACY.
            </h2>
            <span className="mt-6 text-[10px] font-bold uppercase tracking-[0.4em] opacity-70">
              Stories etched in light · forever
            </span>
          </motion.div>
        </div>
      </section>

      <AboutSection />
      <LegacySection />
      <Stats />

      {/* Journey — minimal, photos do the talking */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-[#F9F9EA] border-y border-charcoal/5">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-charcoal/10">
            {journey.map((j, i) => (
              <motion.div
                key={j.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }}
                className="bg-[#F9F9EA] p-6 md:p-10"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 mb-3">
                  {j.num}
                </div>
                <h4 className="text-2xl md:text-3xl font-display italic">{j.title}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — photo-led 3-up */}
      <section id="services" className="py-20 md:py-32 px-3 md:px-6 bg-[#F9F9EA]">
        <div className="mx-auto max-w-[1800px]">
          <Reveal>
            <h3 className="text-3xl sm:text-4xl md:text-6xl font-display tracking-tight text-center mb-8 sm:mb-12 md:mb-20">
              Bespoke <span className="italic font-light">offerings.</span>
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {[
              { title: "Wedding Cinema", img: "/1000407545.jpg", num: "01" },
              { title: "Editorial Portraits", img: "/1000519122.jpg", num: "02" },
              { title: "Film Production", img: "/1000519168.jpg", num: "03" },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1, delay: i * 0.12, ease: [0.19, 1, 0.22, 1] }}
                className="relative aspect-[3/4] overflow-hidden group"
                data-cursor="view"
              >
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between text-cream">
                  <span className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-80">
                    {s.num}
                  </span>
                  <h4 className="text-3xl md:text-5xl font-display italic">
                    {s.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FullBleed
        src="/CA9A3213.JPG"
        caption="Cinema, in stillness."
        meta="No.VI · Selected"
      />

      <UrgencyStrip />

      <Packages />

      {/* Testimonials — photo-backed */}
      <section id="testimonials" className="py-16 md:py-24 px-3 md:px-6 bg-[#F9F9EA]">
        <div className="mx-auto max-w-[1800px]">
          <Reveal>
            <h3 className="text-2xl sm:text-3xl md:text-5xl font-display italic text-center mb-8 sm:mb-12 md:mb-16">
              Words, beautifully kept.
            </h3>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {testimonials.map((t, i) => (
              <motion.figure
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 1, delay: i * 0.12, ease: [0.19, 1, 0.22, 1] }}
                className="relative aspect-[4/5] overflow-hidden group"
              >
                <Image
                  src={t.img}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-cream">
                  <span className="text-5xl md:text-7xl font-display opacity-50 leading-none mb-4">
                    &ldquo;
                  </span>
                  <blockquote className="text-xl md:text-2xl font-display italic leading-snug mb-6">
                    {t.quote}
                  </blockquote>
                  <figcaption className="pt-4 border-t border-cream/20">
                    <p className="text-base font-display">{t.author}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.4em] opacity-70">
                      {t.location}
                    </p>
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <InstagramGrid />

      {/* Inquire / Contact */}
      <section id="contact" className="py-16 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 bg-[#F9F9EA]">
        <div className="mx-auto max-w-[1800px] grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-8">
                VIII . Inquire
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-display tracking-tight leading-[0.95]">
                Begin a <br />
                <span className="italic font-light">conversation.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 max-w-md text-sm leading-relaxed text-zinc-500">
                We take on a small handful of stories each year. Tell us yours — we&rsquo;ll respond within 24 hours.
              </p>
            </Reveal>

            <div className="mt-12 flex flex-col gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
                  Studio
                </p>
                <p className="mt-2 text-base font-display">Rajasthan, India · Available worldwide</p>
              </div>
              <div className="flex gap-6 pt-4 border-t-2 border-black">
                <Magnetic>
                  <a
                    href="https://www.instagram.com/kahani_click?utm_source=qr&igsh=MmY0eG51NHppbmZj"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold uppercase tracking-[0.4em] hover:italic"
                    data-cursor="link"
                  >
                    Instagram ↗
                  </a>
                </Magnetic>
                <Magnetic>
                  <a
                    href="https://wa.me/919610240176"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold uppercase tracking-[0.4em] hover:italic"
                    data-cursor="link"
                  >
                    WhatsApp ↗
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-8 sm:p-10 md:p-14 border-2 border-black rounded-2xl">
            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-20 md:py-28 px-4 sm:px-6 bg-[#F9F9EA] border-t border-charcoal/5">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-charcoal/5 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Frequently asked
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-black tracking-tighter mb-4">
              Questions, <br className="md:hidden" />
              <span className="italic font-light">answered.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm text-zinc-400 mb-12 md:mb-16 italic">
              Everything you need to know about our process and services.
            </p>
          </Reveal>

          <Faq />

          <p className="mt-16 text-sm text-zinc-400">
            Still have questions? Email us at{" "}
            <a
              href="mailto:J.k.sankhla123@gmail.com"
              className="text-charcoal font-bold underline underline-offset-4"
              data-cursor="link"
            >
              J.k.sankhla123@gmail.com
            </a>
          </p>
        </div>
      </section>

      <Newsletter />

      {/* Footer */}
      <footer className="py-12 sm:py-16 px-6 md:px-12 bg-white/30 border-t border-charcoal/10">
        <div className="mx-auto max-w-[1800px]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <Reveal>
              <a href="#top" className="block" data-cursor="link">
                <Logo iconSize={40} className="scale-110 md:scale-125 origin-left" />
              </a>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.4em] text-charcoal/60">
                <a href="#work" className="hover:text-charcoal transition-colors" data-cursor="link">Portfolio</a>
                <a href="#services" className="hover:text-charcoal transition-colors" data-cursor="link">Services</a>
                <a href="#about" className="hover:text-charcoal transition-colors" data-cursor="link">Process</a>
                <a href="#contact" className="hover:text-charcoal transition-colors" data-cursor="link">Contact</a>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 text-center md:text-right">
                © 2024 KAHANI CLICKS. ALL STORIES RESERVED.
              </div>
            </Reveal>
          </div>
        </div>
      </footer>

      <Lightbox
        items={galleryImages}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNav={(n) => setLightboxIndex(n)}
      />
    </main>
  );
}

function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: "Where do you shoot?", a: "We are based in Rajasthan but travel worldwide. Destination weddings across Europe, Southeast Asia, and the Middle East are our specialty." },
    { q: "How early should we book?", a: "For peak season (Oct–Mar), 8–14 months in advance. We accept a limited number of stories per year to maintain creative depth." },
    { q: "What is your turnaround?", a: "Highlight films within 4–6 weeks. Feature films and editorial galleries within 8–12 weeks, color-graded and reviewed personally." },
    { q: "Do you offer custom packages?", a: "Every story is bespoke. We start with a conversation and craft a proposal around your day, not the other way around." },
    { q: "How is payment handled?", a: "All transactions are handled through secure, encrypted gateways. We typically request a retainer to confirm the date." },
    { q: "Languages?", a: "Our team is multilingual — English, Hindi, and several regional Indian languages." },
  ];
  return (
    <div className="space-y-3 text-left">
      {faqs.map((faq, idx) => (
        <FaqItem
          key={idx}
          question={faq.q}
          answer={faq.a}
          isOpen={openIndex === idx}
          onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
        />
      ))}
    </div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border border-charcoal/10 transition-all duration-300 overflow-hidden ${
        isOpen 
          ? "shadow-lg ring-1 ring-charcoal/10 bg-[#FDFCF0]" 
          : "bg-transparent hover:bg-charcoal/5"
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-6 md:px-8 py-5 md:py-6 flex items-center justify-between text-left"
        data-cursor="link"
      >
        <span
          className={`text-base md:text-lg font-bold tracking-tight transition-colors ${isOpen ? "text-charcoal" : "text-zinc-600"
            }`}
        >
          {question}
        </span>
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-charcoal/5 transition-transform duration-500 shrink-0 ${isOpen ? "rotate-45" : ""
            }`}
        >
          <span className="text-xl font-light text-charcoal">+</span>
        </div>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out px-6 md:px-8 ${isOpen ? "max-h-96 pb-6 md:pb-8 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
      >
        <p className="text-sm text-zinc-500 leading-relaxed font-medium">{answer}</p>
      </div>
    </div>
  );
}

