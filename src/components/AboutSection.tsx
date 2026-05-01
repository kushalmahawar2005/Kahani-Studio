"use client";
import Image from "next/image";
import Reveal from "./Reveal";

export default function AboutSection() {
  return (
    <section className="py-16 sm:py-24 md:py-40 px-4 sm:px-6 md:px-12 bg-[#fdfcf0] border-y border-charcoal/5">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
            <Image
              src="/1000928369.jpg"
              alt="J.K. Sankhla — Founder, Kahani Clicks"
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 text-cream">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">
                Founder &amp; Cinematographer
              </p>
              <p className="mt-2 text-2xl font-display italic">J. K. Sankhla</p>
            </div>
          </div>
        </Reveal>

        <div className="lg:col-span-7 lg:pl-8">
          <Reveal>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6">
              I . The Hand Behind The Lens
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display tracking-tight leading-[1.05]">
              A storyteller, <br />
              <span className="italic font-light">first.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-6 sm:mt-10 space-y-4 sm:space-y-6 text-sm sm:text-base leading-relaxed text-zinc-600 max-w-2xl">
              <p>
                Trained in the classical traditions of Rajasthan and inspired by the great cinematic schools of the world, J. K. Sankhla founded Kahani Clicks to bring an editorial sensibility to Indian wedding cinematography.
              </p>
              <p>
                Every project is approached as a film — not a service. From location scouts that read like screenplays to color grades poured over for weeks, the work is patient, precise, and entirely personal.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-md pt-8 border-t border-charcoal/10">
              <Stat label="Years" value="08" />
              <Stat label="Stories" value="240+" />
              <Stat label="Countries" value="14" />
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-12 flex items-end gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                  Signature
                </p>
                <p className="mt-3 font-display italic text-3xl tracking-tight">
                  J·K·Sankhla
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-display tracking-tight">{value}</p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
        {label}
      </p>
    </div>
  );
}
