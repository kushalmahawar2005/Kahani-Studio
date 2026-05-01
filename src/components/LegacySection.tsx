"use client";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { Camera, Film, User, ArrowUpRight } from "lucide-react";

const stats = [
  { num: "10+", label: "Years Experience" },
  { num: "250+", label: "Stories Told" },
];

const services = [
  {
    title: "Editorial Photography",
    desc: "Capturing the essence of your story with a high-fashion, editorial aesthetic.",
    icon: Camera,
    color: "bg-white",
  },
  {
    title: "Cinematic Films",
    desc: "Moving stories told through sophisticated lens-work and artistic editing.",
    icon: Film,
    color: "bg-white",
  },
  {
    title: "Portrait Sessions",
    desc: "Intimate and powerful portraits that reveal the true character of the subject.",
    icon: User,
    color: "bg-white",
  },
];

export default function LegacySection() {
  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 md:px-12 bg-[#F9F9EA]">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Title, Desc, Stats */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <Reveal>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-display tracking-tight leading-[1.1] mb-8">
                  Crafting Your <br />
                  <span className="italic font-light">Legacy in Motion</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-sm sm:text-base md:text-lg text-zinc-500 max-w-md leading-relaxed mb-12">
                  We believe every story is unique. Our approach combines technical mastery with an artistic vision to create timeless heirlooms that celebrate your most precious moments.
                </p>
              </Reveal>
            </div>

            <div className="pt-8 border-t border-charcoal/10 flex gap-12 sm:gap-24">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.2 + i * 0.1}>
                  <div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-display">{s.num}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

            {/* Right Columns: Grid of Cards */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-6">
            
            {/* Editorial Photography */}
            <div className="pt-6 sm:pt-8 md:pt-12">
              <ServiceCard 
                {...services[0]} 
                delay={0.3} 
              />
            </div>

            {/* Cinematic Films */}
            <div>
              <ServiceCard 
                {...services[1]} 
                delay={0.4}
              />
            </div>

            {/* Portrait Sessions */}
            <div>
              <ServiceCard 
                {...services[2]} 
                delay={0.5}
              />
            </div>

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col justify-center p-5 sm:p-8 md:p-12 border border-charcoal/10 rounded-2xl sm:rounded-[2rem] bg-[#F9F9EA] hover:border-charcoal/30 transition-all -mt-6 sm:-mt-8 md:-mt-12"
            >
              <p className="text-sm sm:text-xl md:text-2xl font-display italic mb-4 sm:mb-6 leading-snug">
                Let&rsquo;s create something timeless together.
              </p>
              <a 
                href="#contact" 
                className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
              >
                Book a session
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ title, desc, icon: Icon, delay, className = "" }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className={`p-5 sm:p-8 md:p-12 border border-charcoal/10 rounded-2xl sm:rounded-[2rem] bg-[#F9F9EA] flex flex-col gap-4 sm:gap-6 group hover:border-charcoal/30 transition-all ${className}`}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-charcoal/10 flex items-center justify-center group-hover:border-charcoal transition-colors shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-charcoal" />
      </div>
      <div>
        <h3 className="text-sm sm:text-xl md:text-2xl font-display mb-2 sm:mb-4">{title}</h3>
        <p className="text-[10px] sm:text-xs md:text-sm text-zinc-500 leading-relaxed line-clamp-3 sm:line-clamp-none">
          {desc}
        </p>
      </div>
      {/* Subtle dot */}
      <div className="mt-auto flex justify-end">
        <div className="w-2 h-2 rounded-full bg-charcoal/20 group-hover:bg-charcoal transition-colors" />
      </div>
    </motion.div>
  );
}
