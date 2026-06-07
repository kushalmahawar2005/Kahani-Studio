"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";

/* WhatsApp number used across the site */
const WHATSAPP = "919610240176";
const FALLBACK_EMAIL = "J.k.sankhla123@gmail.com";

type Service = {
  id: string;
  name: string;
  desc: string;
  price: number;
  emoji: string;
};

type Group = { group: string; items: Service[] };

/* Indicative starting prices (INR). Final quote is confirmed by the studio. */
const CATALOG: Group[] = [
  {
    group: "Coverage",
    items: [
      { id: "candid-photo", name: "Candid Photography", desc: "Documentary-style, emotion-first stills", price: 45000, emoji: "📸" },
      { id: "trad-photo", name: "Traditional Photography", desc: "Classic posed & ceremony coverage", price: 30000, emoji: "🪔" },
      { id: "second-shooter", name: "Second Photographer", desc: "Two angles, never a missed moment", price: 18000, emoji: "👥" },
    ],
  },
  {
    group: "Films",
    items: [
      { id: "cine-film", name: "Cinematic Highlight Film", desc: "8–10 min hand-graded wedding film", price: 55000, emoji: "🎬" },
      { id: "trad-video", name: "Traditional Video", desc: "Full-length ceremony documentation", price: 35000, emoji: "🎥" },
      { id: "teaser", name: "Same-Day Teaser", desc: "60-sec reel delivered the same night", price: 25000, emoji: "⚡" },
    ],
  },
  {
    group: "Add-ons",
    items: [
      { id: "drone", name: "Drone Coverage", desc: "Aerial cinematography & stills", price: 20000, emoji: "🚁" },
      { id: "pre-wedding", name: "Pre-Wedding Shoot", desc: "Half-day styled portrait session", price: 40000, emoji: "💍" },
      { id: "live-stream", name: "Live Streaming", desc: "HD stream for family worldwide", price: 15000, emoji: "📡" },
    ],
  },
  {
    group: "Albums & Prints",
    items: [
      { id: "album", name: "Premium Album", desc: "30-sheet fine-art heirloom album", price: 22000, emoji: "📖" },
      { id: "canvas", name: "Canvas Print Set", desc: "Set of 3 framed gallery canvases", price: 8000, emoji: "🖼️" },
    ],
  },
];

const ALL_SERVICES = CATALOG.flatMap((g) => g.items);
const eventTypes = ["Wedding", "Pre-Wedding", "Engagement", "Portrait", "Other"];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

type Status = "idle" | "sending" | "sent" | "error";

type Details = {
  name: string;
  phone: string;
  email: string;
  event: string;
  date: string;
  city: string;
};

const EMPTY: Details = { name: "", phone: "", email: "", event: "", date: "", city: "" };

export default function PackageBuilder() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Details>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const update = (k: keyof Details, v: string) =>
    setDetails((d) => ({ ...d, [k]: v }));

  const chosen = useMemo(
    () => ALL_SERVICES.filter((s) => selected.has(s.id)),
    [selected]
  );
  const total = useMemo(
    () => chosen.reduce((sum, s) => sum + s.price, 0),
    [chosen]
  );

  /* Human-readable package summary, shared by WhatsApp + email. */
  const summary = useMemo(() => {
    const lines = [
      "✨ My Custom Package — Kahani Clicks",
      "",
      ...chosen.map((s) => `• ${s.name} — ${inr.format(s.price)}`),
      "",
      `Estimated total: ${inr.format(total)}`,
      "—",
      details.name && `Name: ${details.name}`,
      details.phone && `Phone: ${details.phone}`,
      details.email && `Email: ${details.email}`,
      details.event && `Event: ${details.event}`,
      details.date && `Date: ${details.date}`,
      details.city && `City / Venue: ${details.city}`,
    ].filter(Boolean);
    return lines.join("\n");
  }, [chosen, total, details]);

  const waHref = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(summary)}`;

  const canSubmit = chosen.length > 0 && details.name.trim() && details.email.trim();

  const handleEmail = async () => {
    if (status === "sending" || !canSubmit) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          event: details.event,
          date: details.date,
          budget: inr.format(total),
          message: summary + "\n\n(Built with the on-site package builder.)",
        }),
      });
      const data: { ok?: boolean; error?: string; code?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.status === 503 && data.code === "not_configured") {
        const subject = encodeURIComponent(`Custom package — ${details.name}`);
        window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${encodeURIComponent(
          summary
        )}`;
        setStatus("sent");
        return;
      }
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Couldn't send. Try WhatsApp instead.");
        return;
      }
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try WhatsApp instead.");
    }
  };

  return (
    <section
      id="builder"
      className="py-16 sm:py-24 md:py-40 px-3 sm:px-6 md:px-12 bg-[#F9F9EA] border-y border-charcoal/5"
    >
      <div className="mx-auto max-w-[1600px]">
        <Reveal>
          <div className="text-center mb-12 md:mb-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6">
              Build your story
            </span>
            <h3 className="text-3xl sm:text-4xl md:text-7xl font-display tracking-tight">
              Craft your <span className="italic">own package.</span>
            </h3>
            <p className="mt-6 mx-auto max-w-xl text-sm text-zinc-500 italic">
              Pick what your day needs, add your details, and watch your bespoke
              package come together — then send it to us, hand to hand.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* ── Service selection ── */}
          <div className="lg:col-span-7 space-y-10 md:space-y-14">
            {CATALOG.map((g) => (
              <div key={g.group}>
                <div className="flex items-baseline justify-between mb-5 border-b border-charcoal/10 pb-3">
                  <h4 className="text-xl md:text-2xl font-display italic">
                    {g.group}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                    {g.items.filter((s) => selected.has(s.id)).length}/
                    {g.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {g.items.map((s) => {
                    const active = selected.has(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggle(s.id)}
                        data-cursor="link"
                        className={`group relative text-left p-5 md:p-6 rounded-2xl border transition-all duration-300 ${
                          active
                            ? "bg-charcoal text-cream border-charcoal shadow-lg"
                            : "bg-[#fdfcf0] border-charcoal/10 hover:border-charcoal/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-2xl leading-none">{s.emoji}</span>
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-full border text-sm shrink-0 transition-all ${
                              active
                                ? "bg-gold border-gold text-charcoal"
                                : "border-charcoal/20 text-transparent group-hover:border-charcoal/50"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <h5 className="mt-4 text-lg font-display tracking-tight">
                          {s.name}
                        </h5>
                        <p
                          className={`mt-1 text-xs leading-relaxed ${
                            active ? "text-cream/70" : "text-zinc-500"
                          }`}
                        >
                          {s.desc}
                        </p>
                        <p
                          className={`mt-4 text-[10px] font-bold uppercase tracking-[0.3em] ${
                            active ? "text-cream/60" : "text-zinc-400"
                          }`}
                        >
                          from {inr.format(s.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Live package summary ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
            <div className="border-2 border-black rounded-2xl p-6 sm:p-8 md:p-10 bg-[#fdfcf0] lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <AnimatePresence mode="wait">
                {status === "sent" ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                    className="py-6"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6">
                      Package received
                    </span>
                    <h4 className="text-3xl md:text-4xl font-display tracking-tight leading-tight mb-5">
                      It&rsquo;s on its way, <span className="italic">truly.</span>
                    </h4>
                    <p className="text-sm leading-relaxed text-zinc-500 max-w-sm">
                      We&rsquo;ll review your bespoke package and respond within
                      24 hours with a confirmed quote.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="mt-8 text-[10px] font-bold uppercase tracking-[0.4em] underline underline-offset-8 hover:italic"
                      data-cursor="link"
                    >
                      Build another
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="builder" initial={false}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6">
                      Your package
                    </span>

                    {chosen.length === 0 ? (
                      <p className="text-sm text-zinc-400 italic py-4">
                        Select services on the left and they&rsquo;ll appear here
                        instantly.
                      </p>
                    ) : (
                      <ul className="space-y-3 mb-6">
                        <AnimatePresence initial={false}>
                          {chosen.map((s) => (
                            <motion.li
                              key={s.id}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="flex items-center gap-2 text-zinc-700">
                                <span>{s.emoji}</span>
                                {s.name}
                              </span>
                              <span className="flex items-center gap-3 shrink-0">
                                <span className="font-display">
                                  {inr.format(s.price)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggle(s.id)}
                                  aria-label={`Remove ${s.name}`}
                                  className="text-zinc-300 hover:text-charcoal transition-colors"
                                  data-cursor="link"
                                >
                                  ✕
                                </button>
                              </span>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}

                    <div className="flex items-baseline justify-between border-t-2 border-black pt-5 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                        Estimated total
                      </span>
                      <motion.span
                        key={total}
                        initial={{ opacity: 0.4, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-2xl md:text-3xl font-display italic"
                      >
                        {inr.format(total)}
                      </motion.span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mb-8 leading-relaxed">
                      Indicative — final quote is confirmed by the studio after a
                      short conversation.
                    </p>

                    {/* Details */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Your name"
                          value={details.name}
                          onChange={(v) => update("name", v)}
                          autoComplete="name"
                        />
                        <Input
                          label="Phone"
                          type="tel"
                          value={details.phone}
                          onChange={(v) => update("phone", v)}
                          autoComplete="tel"
                        />
                      </div>
                      <Input
                        label="Email"
                        type="email"
                        value={details.email}
                        onChange={(v) => update("email", v)}
                        autoComplete="email"
                      />
                      <div>
                        <Label>Event</Label>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {eventTypes.map((e) => (
                            <Pill
                              key={e}
                              label={e}
                              active={details.event === e}
                              onClick={() => update("event", e)}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Date"
                          type="date"
                          value={details.date}
                          onChange={(v) => update("date", v)}
                        />
                        <Input
                          label="City / Venue"
                          value={details.city}
                          onChange={(v) => update("city", v)}
                        />
                      </div>
                    </div>

                    {status === "error" && (
                      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.3em] text-red-700">
                        {errorMsg}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex flex-col gap-3">
                      <Magnetic>
                        <a
                          href={canSubmit ? waHref : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-disabled={!canSubmit}
                          onClick={(e) => {
                            if (!canSubmit) e.preventDefault();
                          }}
                          className={`group flex items-center justify-center gap-3 px-6 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] transition-all w-full ${
                            canSubmit
                              ? "bg-charcoal text-cream"
                              : "bg-charcoal/30 text-cream/70 cursor-not-allowed"
                          }`}
                          data-cursor="link"
                        >
                          Send on WhatsApp
                          <span className="transition-transform group-hover:translate-x-1">
                            ↗
                          </span>
                        </a>
                      </Magnetic>
                      <button
                        type="button"
                        onClick={handleEmail}
                        disabled={!canSubmit || status === "sending"}
                        className="text-[10px] font-bold uppercase tracking-[0.4em] py-2 underline underline-offset-8 hover:italic disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                        data-cursor="link"
                      >
                        {status === "sending" ? "Sending…" : "Or email me this quote"}
                      </button>
                      {!canSubmit && (
                        <p className="text-center text-[10px] text-zinc-400">
                          Add at least one service, your name & email.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
      {children}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-transparent border border-black rounded-lg focus:ring-1 focus:ring-black outline-none px-3 py-2.5 text-base font-display transition-colors"
      />
    </label>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="link"
      className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${
        active
          ? "bg-black text-cream border-black"
          : "border-black text-black hover:bg-black/5"
      }`}
    >
      {label}
    </button>
  );
}
