"use client";

import { useEffect, useMemo, useState } from "react";
import { ADMIN_SECTIONS, allSectionKeys, type AdminSection } from "@/lib/adminSections";

type MediaRow = {
  key: string;
  url: string;
  publicId: string;
  type: "image" | "video";
  width: number | null;
  height: number | null;
  bytes: number | null;
  updatedAt: string;
};

type DisplayItem = {
  key: string;
  url: string;
  type: "image" | "video";
  width: number | null;
  height: number | null;
  bytes: number | null;
  customized: boolean;
};

type RowStatus = "idle" | "signing" | "uploading" | "saving" | "deleting" | "error";

const PASSCODE_STORAGE_KEY = "kahani-admin-passcode";
const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;
const CHUNK = 20 * 1024 * 1024; // 20MB

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
};

function isVideoKey(key: string) {
  return VIDEO_EXT.test(key);
}

function formatBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const GROUPS: AdminSection["group"][] = ["Branding", "Homepage"];

export default function AdminPage() {
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(true);

  const [rows, setRows] = useState<MediaRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [rowStatus, setRowStatus] = useState<Record<string, RowStatus>>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [rowProgress, setRowProgress] = useState<Record<string, number>>({});
  const [sectionId, setSectionId] = useState("overview");

  // Try a saved passcode once on load.
  useEffect(() => {
    const saved = sessionStorage.getItem(PASSCODE_STORAGE_KEY);
    if (saved) {
      tryUnlock(saved);
    } else {
      setChecking(false);
    }
  }, []);

  async function tryUnlock(code: string) {
    setChecking(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/media", { headers: { "x-admin-passcode": code } });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; rows?: MediaRow[]; error?: string };
      if (!res.ok || !data.ok) {
        setAuthError(data.error || "Could not unlock.");
        sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
        setAuthed(false);
      } else {
        sessionStorage.setItem(PASSCODE_STORAGE_KEY, code);
        setRows(data.rows ?? []);
        setAuthed(true);
      }
    } catch {
      setAuthError("Network error.");
    } finally {
      setChecking(false);
    }
  }

  function lock() {
    sessionStorage.removeItem(PASSCODE_STORAGE_KEY);
    setAuthed(false);
    setPasscode("");
  }

  async function refreshRows() {
    const code = sessionStorage.getItem(PASSCODE_STORAGE_KEY) ?? "";
    try {
      const res = await fetch("/api/admin/media", { headers: { "x-admin-passcode": code } });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; rows?: MediaRow[]; error?: string };
      if (data.ok) {
        setRows(data.rows ?? []);
        setLoadError("");
      } else {
        setLoadError(data.error || "Could not refresh the list.");
      }
    } catch {
      setLoadError("Network error refreshing the list.");
    }
  }

  const rowsByKey = useMemo(() => {
    const map = new Map<string, MediaRow>();
    for (const r of rows) map.set(r.key, r);
    return map;
  }, [rows]);

  const totalKeys = useMemo(() => allSectionKeys(), []);
  const customizedCount = useMemo(
    () => totalKeys.filter((k) => rowsByKey.has(k)).length,
    [totalKeys, rowsByKey]
  );

  function displayItemFor(key: string): DisplayItem {
    const row = rowsByKey.get(key);
    if (row) {
      return {
        key: row.key,
        url: row.url,
        type: row.type,
        width: row.width,
        height: row.height,
        bytes: row.bytes,
        customized: true,
      };
    }
    return {
      key,
      url: `/${key}`,
      type: isVideoKey(key) ? "video" : "image",
      width: null,
      height: null,
      bytes: null,
      customized: false,
    };
  }

  function itemsForSection(section: AdminSection): DisplayItem[] {
    const seen = new Set<string>();
    const items: DisplayItem[] = [];
    for (const key of section.keys) {
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(displayItemFor(key));
    }
    return items;
  }

  const activeSection = ADMIN_SECTIONS.find((s) => s.id === sectionId) ?? null;

  const visibleItems = useMemo(() => {
    if (!activeSection) return [];
    const items = itemsForSection(activeSection);
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.key.toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, rowsByKey, search]);

  async function handleReplace(key: string, file: File) {
    const code = sessionStorage.getItem(PASSCODE_STORAGE_KEY) ?? "";
    setRowError((e) => ({ ...e, [key]: "" }));
    setRowProgress((p) => ({ ...p, [key]: 0 }));
    setRowStatus((s) => ({ ...s, [key]: "signing" }));

    const isVideo = file.type.startsWith("video/") || VIDEO_EXT.test(file.name);
    const resourceType = isVideo ? "video" : "image";

    try {
      const signRes = await fetch("/api/admin/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": code },
        body: JSON.stringify({ key }),
      });
      const sign = await signRes.json();
      if (!signRes.ok || !sign.ok) throw new Error(sign.error || "Could not sign the upload.");

      setRowStatus((s) => ({ ...s, [key]: "uploading" }));
      const endpoint = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`;
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const total = file.size;
      let result: CloudinaryUploadResult | null = null;

      for (let start = 0; start < total; start += CHUNK) {
        const end = Math.min(start + CHUNK, total);
        const form = new FormData();
        form.append("file", file.slice(start, end));
        form.append("api_key", sign.apiKey);
        form.append("timestamp", String(sign.timestamp));
        form.append("signature", sign.signature);
        form.append("folder", sign.folder);
        form.append("public_id", sign.publicId);
        form.append("overwrite", "true");

        const data = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", endpoint);
          xhr.setRequestHeader("X-Unique-Upload-Id", uid);
          xhr.setRequestHeader("Content-Range", `bytes ${start}-${end - 1}/${total}`);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setRowProgress((p) => ({ ...p, [key]: Math.round(((start + e.loaded) / total) * 100) }));
            }
          };
          xhr.onload = () => {
            try {
              const json = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300) resolve(json);
              else reject(new Error(json?.error?.message || `Upload failed (${xhr.status}).`));
            } catch {
              reject(new Error("Unexpected response from Cloudinary."));
            }
          };
          xhr.onerror = () => reject(new Error("Network error during upload."));
          xhr.send(form);
        });
        if (data) result = data;
      }
      if (!result) throw new Error("Upload finished without a result.");

      setRowStatus((s) => ({ ...s, [key]: "saving" }));
      const saveRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-passcode": code },
        body: JSON.stringify({
          key,
          url: result.secure_url,
          publicId: result.public_id,
          type: resourceType,
          width: result.width ?? null,
          height: result.height ?? null,
          bytes: result.bytes ?? null,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.ok) throw new Error(saveData.error || "Could not save.");

      setRowStatus((s) => ({ ...s, [key]: "idle" }));
      await refreshRows();
    } catch (err) {
      setRowStatus((s) => ({ ...s, [key]: "error" }));
      setRowError((e) => ({ ...e, [key]: err instanceof Error ? err.message : "Something went wrong." }));
    }
  }

  async function handleReset(key: string) {
    if (!confirm(`Reset "${key}" to the bundled default? The site will fall back to its original /public photo.`)) {
      return;
    }
    const code = sessionStorage.getItem(PASSCODE_STORAGE_KEY) ?? "";
    setRowStatus((s) => ({ ...s, [key]: "deleting" }));
    setRowError((e) => ({ ...e, [key]: "" }));
    try {
      const res = await fetch(`/api/admin/media?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers: { "x-admin-passcode": code },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not reset.");
      setRowStatus((s) => ({ ...s, [key]: "idle" }));
      await refreshRows();
    } catch (err) {
      setRowStatus((s) => ({ ...s, [key]: "error" }));
      setRowError((e) => ({ ...e, [key]: err instanceof Error ? err.message : "Something went wrong." }));
    }
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F9F9EA] text-[#1a1a1a]">
        <p className="text-sm text-zinc-400">Checking…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F9F9EA] px-4 text-[#1a1a1a]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            tryUnlock(passcode);
          }}
          className="w-full max-w-sm rounded-2xl border border-charcoal/10 bg-white/60 p-8"
        >
          <h1 className="font-display text-2xl italic">Site Admin</h1>
          <p className="mt-2 text-sm text-zinc-500">Enter the admin passcode to manage site images and videos.</p>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            autoFocus
            className="mt-6 w-full rounded-lg border border-black/20 bg-transparent px-4 py-3 text-base outline-none focus:ring-1 focus:ring-black"
            placeholder="Passcode"
          />
          {authError && <p className="mt-3 text-sm text-red-700">{authError}</p>}
          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-charcoal px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cream"
          >
            Unlock
          </button>
        </form>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F9F9EA] text-[#1a1a1a]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-charcoal text-cream md:flex">
        <div className="px-6 py-7">
          <h1 className="font-display text-xl italic leading-none">Kahani Clicks</h1>
          <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.4em] text-cream/40">Admin</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          <SectionNavItem
            label="Overview"
            active={sectionId === "overview"}
            onClick={() => setSectionId("overview")}
          />

          {GROUPS.map((group) => (
            <div key={group} className="mt-6">
              <p className="px-3 text-[9px] font-bold uppercase tracking-[0.35em] text-cream/30">{group}</p>
              <div className="mt-2 flex flex-col gap-0.5">
                {ADMIN_SECTIONS.filter((s) => s.group === group).map((section) => {
                  const items = itemsForSection(section);
                  const done = items.filter((i) => i.customized).length;
                  return (
                    <SectionNavItem
                      key={section.id}
                      label={section.label}
                      count={`${done}/${items.length}`}
                      active={sectionId === section.id}
                      onClick={() => setSectionId(section.id)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-cream/10 px-6 py-5">
          <p className="text-xs font-bold">Site Admin</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cream/40">Super admin</p>
          <button
            onClick={lock}
            className="mt-3 w-full rounded-full border border-cream/20 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-cream/70 transition-colors hover:border-cream hover:text-cream"
          >
            Lock
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 bg-[#F9F9EA]/90 px-4 py-4 backdrop-blur md:px-8">
          <div>
            <h2 className="font-display text-xl italic leading-none md:text-2xl">
              {activeSection ? activeSection.label : "Overview"}
            </h2>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">
              {activeSection
                ? `${itemsForSection(activeSection).length} images & videos in this section`
                : `${customizedCount}/${totalKeys.length} assets customized`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeSection && (
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search this section…"
                className="w-full max-w-xs rounded-full border border-black/20 bg-transparent px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            )}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-full border border-charcoal/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] transition-colors hover:border-charcoal"
            >
              View store
            </a>
          </div>
        </header>

        {loadError && <p className="px-8 py-4 text-sm text-red-700">{loadError}</p>}

        {!activeSection ? (
          <OverviewPanel
            customizedCount={customizedCount}
            totalKeys={totalKeys.length}
            onOpenSection={setSectionId}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 md:p-8 lg:grid-cols-5">
            {visibleItems.map((item) => {
              const status = rowStatus[item.key] ?? "idle";
              const busy = status === "signing" || status === "uploading" || status === "saving" || status === "deleting";
              return (
                <div key={item.key} className="overflow-hidden rounded-xl border border-charcoal/10 bg-white/60">
                  <div className="relative aspect-square bg-black/5">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.key} className="h-full w-full object-cover" />
                    )}
                    {item.type === "video" && (
                      <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Video
                      </span>
                    )}
                    <span
                      className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        item.customized ? "bg-charcoal text-cream" : "bg-white/80 text-zinc-500"
                      }`}
                    >
                      {item.customized ? "Customized" : "Default"}
                    </span>
                    {busy && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-cream">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                          {status === "uploading" ? `${rowProgress[item.key] ?? 0}%` : status}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[11px] font-bold" title={item.key}>
                      {item.key}
                    </p>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                      {formatBytes(item.bytes) || (item.customized ? "" : "bundled default")}
                    </p>
                    {rowError[item.key] && <p className="mt-1 text-[10px] text-red-700">{rowError[item.key]}</p>}
                    <div className="mt-2 flex gap-2">
                      <label
                        className={`flex-1 cursor-pointer rounded-full border border-charcoal/20 py-1.5 text-center text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-charcoal ${
                          busy ? "pointer-events-none opacity-40" : ""
                        }`}
                      >
                        Replace
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          disabled={busy}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (file) handleReplace(item.key, file);
                          }}
                        />
                      </label>
                      {item.customized && (
                        <button
                          onClick={() => handleReset(item.key)}
                          disabled={busy}
                          className="flex-1 rounded-full border border-charcoal/20 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-40"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionNavItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12px] font-semibold transition-colors ${
        active ? "bg-cream text-charcoal" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
      }`}
    >
      <span className="truncate">{label}</span>
      {count && (
        <span className={`shrink-0 text-[9px] font-bold ${active ? "text-charcoal/50" : "text-cream/40"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function OverviewPanel({
  customizedCount,
  totalKeys,
  onOpenSection,
}: {
  customizedCount: number;
  totalKeys: number;
  onOpenSection: (id: string) => void;
}) {
  const defaults = totalKeys - customizedCount;
  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total media slots" value={totalKeys} />
        <StatCard label="Customized" value={customizedCount} />
        <StatCard label="Using bundled default" value={defaults} />
      </div>

      <div className="mt-8 rounded-2xl border border-charcoal/10 bg-white/60 p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Sections</p>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ADMIN_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => onOpenSection(section.id)}
              className="flex items-center justify-between rounded-xl border border-charcoal/10 px-4 py-3 text-left transition-colors hover:border-charcoal"
            >
              <span className="text-sm font-semibold">{section.label}</span>
              <span className="text-zinc-300">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-white/60 p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">{label}</p>
      <p className="mt-2 font-display text-4xl">{value}</p>
    </div>
  );
}
