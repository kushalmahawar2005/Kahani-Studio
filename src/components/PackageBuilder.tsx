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
  unit?: string;
  /* When set, the client picks a day count and price = price × days. */
  perDay?: boolean;
  defaultDays?: number;
};

type Group = { group: string; items: Service[] };

/* Day-count options for per-day services. */
const DAY_OPTIONS = [1, 2, 3, 4, 5] as const;
const MIN_DAYS = DAY_OPTIONS[0];
const MAX_DAYS = DAY_OPTIONS[DAY_OPTIONS.length - 1];

/* Indicative starting prices (INR). Final quote is confirmed by the studio.
   For per-day services, `price` is the per-day rate. */
const CATALOG: Group[] = [
  {
    group: "Coverage",
    items: [
      { id: "candid-photo", name: "Candid Photography", desc: "Documentary-style, emotion-first stills", price: 10000, emoji: "📸", perDay: true, defaultDays: 1 },
      { id: "trad-photo", name: "Traditional Photography", desc: "Classic posed & ceremony coverage", price: 10000, emoji: "🪔", perDay: true, defaultDays: 2 },
    ],
  },
  {
    group: "Films",
    items: [
      { id: "trad-video", name: "Traditional Videography", desc: "Full-length ceremony documentation", price: 10000, emoji: "🎥", perDay: true, defaultDays: 2 },
      { id: "cinematography", name: "Cinematography", desc: "Cinematic, hand-graded wedding film", price: 10000, emoji: "🎬", perDay: true, defaultDays: 1 },
      { id: "wedding-reel", name: "Wedding Reel", desc: "Full-wedding reel delivered for socials", price: 25000, emoji: "📱", perDay: true, defaultDays: 1 },
    ],
  },
  {
    group: "Add-ons",
    items: [
      { id: "drone", name: "Drone Coverage", desc: "Aerial cinematography & stills", price: 7000, emoji: "🚁", perDay: true, defaultDays: 1 },
    ],
  },
  {
    group: "Albums & Prints",
    items: [
      { id: "album", name: "Album Design", desc: "Fine-art heirloom album design", price: 22000, emoji: "📖", perDay: true, defaultDays: 1 },
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

const clampDays = (n: number) =>
  Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.round(n)));

const dayLabel = (n: number) => `${n} ${n > 1 ? "days" : "day"}`;

/* Price label for the service card: a per-day rate, or a flat price with an
   optional billing unit (e.g. "/ 2 days"). */
const priceLabel = (s: Service) =>
  s.perDay
    ? `${inr.format(s.price)} / day`
    : `${inr.format(s.price)}${s.unit ? ` / ${s.unit}` : ""}`;

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
  /* Per-service day count, keyed by service id. Missing = service default. */
  const [days, setDays] = useState<Record<string, number>>({});
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

  const setDay = (id: string, n: number) =>
    setDays((d) => ({ ...d, [id]: clampDays(n) }));

  const update = (k: keyof Details, v: string) =>
    setDetails((d) => ({ ...d, [k]: v }));

  /* Chosen day count for a per-day service (falls back to its default). */
  const daysOf = (s: Service) =>
    s.perDay ? days[s.id] ?? s.defaultDays ?? MIN_DAYS : undefined;

  /* Line price: per-day rate × chosen days, or the flat price. */
  const lineTotal = (s: Service) =>
    s.perDay ? s.price * (days[s.id] ?? s.defaultDays ?? MIN_DAYS) : s.price;

  const chosen = useMemo(
    () => ALL_SERVICES.filter((s) => selected.has(s.id)),
    [selected]
  );
  const total = useMemo(
    () => chosen.reduce((sum, s) => sum + lineTotal(s), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chosen, days]
  );

  /* Human-readable package summary, shared by WhatsApp + email. */
  const summary = useMemo(() => {
    const lines = [
      "✨ My Custom Package — Kahani Clicks",
      "",
      ...chosen.map((s) => {
        const d = daysOf(s);
        return `• ${s.name}${d ? ` (${dayLabel(d)})` : ""} — ${inr.format(lineTotal(s))}`;
      }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen, total, details, days]);

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
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                  {g.items.map((s) => {
                    const active = selected.has(s.id);
                    return (
                      <div
                        key={s.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={active}
                        onClick={() => toggle(s.id)}
                        onKeyDown={(e) => {
                          if (e.target !== e.currentTarget) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggle(s.id);
                          }
                        }}
                        data-cursor="link"
                        className={`group relative flex flex-col text-left cursor-pointer p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl border transition-all duration-300 ${
                          active
                            ? "bg-charcoal text-cream border-charcoal shadow-lg"
                            : "bg-[#fdfcf0] border-charcoal/10 hover:border-charcoal/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xl sm:text-2xl leading-none">{s.emoji}</span>
                          <span
                            className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full border text-xs sm:text-sm shrink-0 transition-all ${
                              active
                                ? "bg-gold border-gold text-charcoal"
                                : "border-charcoal/20 text-transparent group-hover:border-charcoal/50"
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <h5 className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg font-display tracking-tight leading-tight">
                          {s.name}
                        </h5>
                        <p
                          className={`mt-1 text-[11px] sm:text-xs leading-relaxed line-clamp-2 sm:line-clamp-none ${
                            active ? "text-cream/70" : "text-zinc-500"
                          }`}
                        >
                          {s.desc}
                        </p>
                        <p
                          className={`mt-3 md:mt-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.3em] ${
                            active ? "text-cream/60" : "text-zinc-400"
                          }`}
                        >
                          from {priceLabel(s)}
                        </p>

                        {active && s.perDay && (
                          <div
                            className="mt-3 flex flex-wrap items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-cream/50 mr-0.5">
                              Days
                            </span>
                            {DAY_OPTIONS.map((n) => {
                              const on = daysOf(s) === n;
                              return (
                                <button
                                  key={n}
                                  type="button"
                                  aria-label={`Set ${dayLabel(n)}`}
                                  aria-pressed={on}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDay(s.id, n);
                                  }}
                                  className={`w-6 h-6 rounded-full text-[11px] font-display leading-none transition-all ${
                                    on
                                      ? "bg-gold text-charcoal"
                                      : "bg-cream/10 text-cream/70 hover:bg-cream/25"
                                  }`}
                                >
                                  {n}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ── Live package summary ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-[100px] lg:self-start">
            <div className="border-2 border-black rounded-2xl p-6 sm:p-8 md:p-10 bg-[#fdfcf0] lg:flex lg:flex-col lg:max-h-[calc(100vh_-_120px)] lg:overflow-hidden">
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
                  <motion.div key="builder" initial={false} className="lg:flex lg:flex-col lg:flex-1 lg:min-h-0">
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6 lg:shrink-0">
                      Your package
                    </span>

                    <div className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
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
                              className="flex items-start justify-between gap-3 text-sm"
                            >
                              <span className="flex flex-col gap-1.5 min-w-0">
                                <span className="flex items-center gap-2 text-zinc-700">
                                  <span>{s.emoji}</span>
                                  {s.name}
                                </span>
                                {s.perDay && (
                                  <span className="flex flex-wrap items-center gap-1">
                                    {DAY_OPTIONS.map((n) => {
                                      const on = daysOf(s) === n;
                                      return (
                                        <button
                                          key={n}
                                          type="button"
                                          aria-label={`Set ${dayLabel(n)} for ${s.name}`}
                                          aria-pressed={on}
                                          onClick={() => setDay(s.id, n)}
                                          className={`w-5 h-5 rounded-full text-[10px] font-display leading-none transition-all ${
                                            on
                                              ? "bg-charcoal text-cream"
                                              : "bg-charcoal/5 text-zinc-500 hover:bg-charcoal/15"
                                          }`}
                                          data-cursor="link"
                                        >
                                          {n}
                                        </button>
                                      );
                                    })}
                                    <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                                      days
                                    </span>
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-3 shrink-0">
                                <span className="font-display">
                                  {s.perDay ? inr.format(lineTotal(s)) : priceLabel(s)}
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
                    </div>

                    <div className="lg:shrink-0">
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
