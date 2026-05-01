"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const eventTypes = ["Wedding", "Pre-Wedding", "Portrait", "Editorial", "Other"];
const budgets = ["< ₹2 L", "₹2 – 5 L", "₹5 – 10 L", "10 L +"];

const FALLBACK_EMAIL = "J.k.sankhla123@gmail.com";

type Status = "idle" | "sending" | "sent" | "error";

type FormState = {
  name: string;
  email: string;
  event: string;
  date: string;
  budget: string;
  message: string;
  hp: string;
};

const EMPTY: FormState = {
  name: "",
  email: "",
  event: "",
  date: "",
  budget: "",
  message: "",
  hp: "",
};

function buildMailto(form: FormState) {
  const lines = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    form.event && `Event: ${form.event}`,
    form.date && `Date: ${form.date}`,
    form.budget && `Budget: ${form.budget}`,
    "",
    form.message,
  ].filter(Boolean);
  const body = encodeURIComponent(lines.join("\n"));
  const subject = encodeURIComponent(
    `Inquiry from ${form.name}${form.event ? ` · ${form.event}` : ""}`
  );
  return `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
}

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: { ok?: boolean; error?: string; code?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.status === 503 && data.code === "not_configured") {
        /* Backend not wired yet — fall back to user's mail client. */
        window.location.href = buildMailto(form);
        setStatus("sent");
        return;
      }

      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(
          data.error || "Something went wrong. Please try email or WhatsApp."
        );
        return;
      }

      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="py-10"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-6">
              Inquiry received
            </span>
            <h3 className="text-4xl md:text-5xl font-display tracking-tight leading-[1.05] mb-6">
              Thank you, <span className="italic font-light">truly.</span>
            </h3>
            <p className="text-sm leading-relaxed text-zinc-500 max-w-md">
              Your note is on its way to the studio. We&rsquo;ll respond within
              24 hours — usually sooner. Until then, feel free to wander
              through the work.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-10 text-[10px] font-bold uppercase tracking-[0.4em] underline underline-offset-8 hover:italic"
              data-cursor="link"
            >
              Send another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={false}
            onSubmit={handleSubmit}
            noValidate
            className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10"
          >
            <Field
              label="Your name"
              value={form.name}
              onChange={(v) => update("name", v)}
              required
              autoComplete="name"
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => update("email", v)}
              required
              autoComplete="email"
            />

            <div className="md:col-span-2">
              <Label>Event</Label>
              <div className="flex flex-wrap gap-3 mt-3">
                {eventTypes.map((e) => (
                  <Pill
                    key={e}
                    label={e}
                    active={form.event === e}
                    onClick={() => update("event", e)}
                  />
                ))}
              </div>
            </div>

            <Field
              label="Approx. date"
              type="date"
              value={form.date}
              onChange={(v) => update("date", v)}
            />

            <div>
              <Label>Investment</Label>
              <div className="flex flex-wrap gap-3 mt-3">
                {budgets.map((b) => (
                  <Pill
                    key={b}
                    label={b}
                    active={form.budget === b}
                    onClick={() => update("budget", b)}
                  />
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label>Tell us about your story</Label>
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                required
                rows={4}
                className="mt-3 w-full bg-transparent border border-black rounded-lg focus:ring-1 focus:ring-black outline-none p-4 text-base font-display resize-none transition-colors"
                placeholder="The vision, locations, anything we should know…"
              />
            </div>

            {/* Honeypot — hidden from real users, catches bots */}
            <div
              aria-hidden="true"
              className="absolute -left-[9999px] w-px h-px overflow-hidden"
            >
              <label>
                Leave this field empty
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.hp}
                  onChange={(e) => update("hp", e.target.value)}
                />
              </label>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6">
              <div className="min-h-[1.5rem]">
                {status === "error" ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-red-700">
                    {errorMsg}
                  </p>
                ) : (
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                    {status === "sending"
                      ? "Sending…"
                      : "We respond within 24 hrs"}
                  </p>
                )}
              </div>
              <motion.button
                whileHover={status === "sending" ? undefined : { scale: 1.04 }}
                whileTap={status === "sending" ? undefined : { scale: 0.97 }}
                type="submit"
                disabled={status === "sending"}
                className="group flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-8 py-4 sm:py-5 bg-charcoal text-cream rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                data-cursor="link"
              >
                {status === "sending" ? "Sending" : "Send inquiry"}
                <span
                  className={`transition-transform ${status === "sending"
                    ? "animate-pulse"
                    : "group-hover:translate-x-1"
                    }`}
                >
                  →
                </span>
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400">
      {children}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="mt-3 w-full bg-transparent border border-black rounded-lg focus:ring-1 focus:ring-black outline-none px-4 py-3 text-lg font-display transition-colors"
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
      className={`px-5 py-2 rounded-full border text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${active
        ? "bg-black text-cream border-black"
        : "border-black text-black hover:bg-black/5"
        }`}
    >
      {label}
    </button>
  );
}
