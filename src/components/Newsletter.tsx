"use client";
import { motion } from "framer-motion";
import Reveal from "./Reveal";

export default function Newsletter() {
  return (
    <section className="py-12 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 bg-[#F9F9EA]">
      <div className="mx-auto max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="relative bg-transparent border border-charcoal/10 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] p-8 sm:p-12 md:p-24 overflow-hidden"
        >
          {/* Subtle dot at top right */}
          <div className="absolute top-12 right-12 w-2 h-2 rounded-full bg-charcoal" />

          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl md:text-8xl font-display tracking-tight mb-6">
                Stay Inspired
              </h2>
            </Reveal>
            
            <Reveal delay={0.1}>
              <p className="text-sm sm:text-base md:text-lg text-zinc-500 max-w-2xl mb-12 leading-relaxed">
                Join our exclusive circle for stories, behind-the-scenes, and seasonal collection releases.
              </p>
            </Reveal>

            <Reveal delay={0.2} className="w-full max-w-xl">
              <form 
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-4 w-full"
              >
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-1 bg-transparent border border-charcoal/20 rounded-full px-8 py-4 outline-none focus:border-charcoal transition-all placeholder:text-zinc-400"
                />
                <button 
                  type="submit"
                  className="bg-transparent text-charcoal px-10 py-4 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-charcoal hover:text-cream transition-all border border-charcoal/20"
                >
                  Subscribe
                </button>
              </form>
            </Reveal>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
