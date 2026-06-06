"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import type { Memory } from "@/lib/memories";

const STUDIO_PASSWORD = process.env.NEXT_PUBLIC_STUDIO_PASSWORD || "kahani2026";

export default function StudioPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted unlock on mount
    if (sessionStorage.getItem("studio_ok") === "1") setUnlocked(true);
  }, []);

  function tryUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (pw === STUDIO_PASSWORD) {
      sessionStorage.setItem("studio_ok", "1");
      setUnlocked(true);
    } else {
      alert("Galat password");
    }
  }

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#F9F9EA] flex items-center justify-center px-6">
        <form onSubmit={tryUnlock} className="w-full max-w-sm text-center">
          <h1 className="font-display text-3xl italic">Studio</h1>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
            Kahani Clicks · Living Memories
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className="mt-8 w-full rounded-full border border-charcoal/20 bg-white px-5 py-3 text-center outline-none focus:border-charcoal"
          />
          <button className="mt-4 w-full rounded-full bg-charcoal px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cream">
            Enter
          </button>
        </form>
      </main>
    );
  }

  return <StudioDashboard />;
}

function StudioDashboard() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    const res = await fetch("/api/memories");
    const data = await res.json();
    setMemories(data.memories ?? []);
    setLoading(false);
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch list on mount
    load();
  }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/memories", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Failed");
      formRef.current?.reset();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Is memory ko delete karein?")) return;
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="min-h-screen bg-[#F9F9EA] text-[#1a1a1a]">
      <header className="border-b border-charcoal/10 px-4 py-5 md:px-10">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between">
          <div>
            <h1 className="font-display text-2xl italic">Living Memories · Studio</h1>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.35em] text-zinc-400">
              Scan · Watch · Cherish
            </p>
          </div>
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-charcoal">
            ← Home
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-10 px-4 py-8 md:grid-cols-2 md:px-10">
        {/* Create */}
        <section>
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
            New memory
          </h2>
          <form ref={formRef} onSubmit={create} className="space-y-4 rounded-2xl border border-charcoal/10 bg-white p-6">
            <Field label="Couple / title *">
              <input name="coupleName" required maxLength={80} placeholder="Kaushal & Poonam" className={INP} />
            </Field>
            <Field label="Subtitle">
              <input name="subtitle" maxLength={120} placeholder="Udaipur · 2026" className={INP} />
            </Field>
            <Field label="Event / ceremony">
              <select name="event" defaultValue="Wedding" className={SEL}>
                {EVENTS.map((ev) => (
                  <option key={ev} value={ev}>
                    {ev}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Poster photo *">
              <input name="poster" type="file" accept="image/*" required className={FILE} />
            </Field>
            <Field label="Video *">
              <input name="video" type="file" accept="video/*" required className={FILE} />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              disabled={saving}
              className="w-full rounded-full bg-charcoal px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cream disabled:opacity-40"
            >
              {saving ? "Uploading…" : "Create memory + QR"}
            </button>
            <p className="text-[11px] leading-relaxed text-zinc-400">
              MVP: media site ke <code>/public</code> me save hoti hai. Cloud (Cloudinary) baad me swap kar denge.
            </p>
          </form>
        </section>

        {/* List */}
        <section>
          <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
            {memories.length} memories
          </h2>
          {loading ? (
            <p className="text-sm text-zinc-400">Loading…</p>
          ) : memories.length === 0 ? (
            <p className="text-sm text-zinc-400">Abhi koi memory nahi. Pehli banao →</p>
          ) : (
            <div className="space-y-4">
              {memories.map((m) => (
                <MemoryCard key={m.id} memory={m} onDelete={() => remove(m.id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const EVENTS = [
  "Wedding",
  "Pre-Wedding",
  "Engagement",
  "Haldi",
  "Mehendi",
  "Sangeet",
  "Reception",
  "Ring Ceremony",
  "Other",
];

const INP =
  "w-full rounded-full border border-charcoal/20 bg-white px-4 py-2.5 outline-none focus:border-charcoal";
const SEL =
  "w-full appearance-none rounded-full border border-charcoal/20 bg-white px-4 py-2.5 outline-none focus:border-charcoal cursor-pointer bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10";
const FILE =
  "w-full text-sm text-zinc-600 file:mr-3 file:rounded-full file:border-0 file:bg-charcoal file:px-3 file:py-1.5 file:text-[9px] file:font-bold file:uppercase file:tracking-[0.2em] file:text-cream";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function MemoryCard({ memory, onDelete }: { memory: Memory; onDelete: () => void }) {
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/m/${memory.id}` : "";

  useEffect(() => {
    if (!link) return;
    QRCode.toDataURL(link, { width: 320, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } })
      .then(setQr)
      .catch(() => {});
  }, [link]);

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex gap-4 rounded-2xl border border-charcoal/10 bg-white p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={memory.poster} alt="" className="h-24 w-20 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg italic leading-tight">{memory.coupleName}</h3>
          {memory.event && (
            <span className="rounded-full bg-charcoal/5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              {memory.event}
            </span>
          )}
        </div>
        {memory.subtitle && (
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">{memory.subtitle}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={`/m/${memory.id}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-charcoal px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-cream"
          >
            Open ↗
          </a>
          <button
            onClick={copy}
            className="rounded-full border border-charcoal/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:border-charcoal"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          {qr && (
            <a
              href={qr}
              download={`qr-${memory.id}.png`}
              className="rounded-full border border-charcoal/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:border-charcoal"
            >
              Download QR
            </a>
          )}
          <button
            onClick={onDelete}
            className="rounded-full border border-charcoal/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:border-red-500 hover:text-red-500"
          >
            Delete
          </button>
        </div>
      </div>
      {qr && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qr} alt="QR" className="h-24 w-24 shrink-0 rounded-lg border border-charcoal/10" />
      )}
    </div>
  );
}
