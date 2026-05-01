"use client";
import Reveal from "./Reveal";

const press = [
  "WedMeGood",
  "Vogue Wedding",
  "ShaadiSaga",
  "Better Half",
  "Brides Today",
  "Condé Nast",
];

export default function PressStrip() {
  return (
    <section className="py-16 md:py-24 px-6 md:px-12 border-y border-charcoal/10 bg-[#fdfcf0]">
      <Reveal>
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 mb-10">
          As featured in
        </p>
      </Reveal>
      <div className="mx-auto max-w-[1400px] grid grid-cols-2 md:grid-cols-6 gap-y-8 gap-x-12 items-center">
        {press.map((p, i) => (
          <Reveal key={p} delay={i * 0.05}>
            <div className="text-center text-base md:text-lg font-display italic text-charcoal/60 hover:text-charcoal transition-colors">
              {p}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
