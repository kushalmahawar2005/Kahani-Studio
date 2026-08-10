"use client";

import { useEffect, useMemo, useState } from "react";

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

/** Cloudinary can render a poster frame from a video URL. */
function posterFrom(url: string) {
  return url.replace("/upload/", "/upload/so_0,w_500,q_auto/").replace(VIDEO_EXT, ".jpg");
}

function formatBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.key.toLowerCase().includes(q));
  }, [rows, search]);

  async function handleReplace(row: MediaRow, file: File) {
    const key = row.key;
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

  async function handleDelete(row: MediaRow) {
    const key = row.key;
    if (!confirm(`Delete "${key}"? The site will fall back to its original bundled photo — nothing will break.`)) {
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
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not delete.");
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
    <main className="min-h-screen bg-[#F9F9EA] text-[#1a1a1a]">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 bg-[#F9F9EA]/90 px-4 py-4 backdrop-blur md:px-8">
        <div>
          <h1 className="font-display text-xl italic leading-none md:text-2xl">Site Admin</h1>
          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            {rows.length} images &amp; videos on the site
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full max-w-xs rounded-full border border-black/20 bg-transparent px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
        />
      </header>

      {loadError && <p className="px-8 py-4 text-sm text-red-700">{loadError}</p>}

      <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 md:p-8 lg:grid-cols-5">
        {filtered.map((row) => {
          const status = rowStatus[row.key] ?? "idle";
          const busy = status === "signing" || status === "uploading" || status === "saving" || status === "deleting";
          return (
            <div key={row.key} className="overflow-hidden rounded-xl border border-charcoal/10 bg-white/60">
              <div className="relative aspect-square bg-black/5">
                {row.type === "video" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={posterFrom(row.url)} alt={row.key} className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.url} alt={row.key} className="h-full w-full object-cover" />
                )}
                {row.type === "video" && (
                  <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Video
                  </span>
                )}
                {busy && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-cream">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                      {status === "uploading" ? `${rowProgress[row.key] ?? 0}%` : status}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-[11px] font-bold" title={row.key}>
                  {row.key}
                </p>
                <p className="mt-0.5 text-[10px] text-zinc-400">
                  {row.width && row.height ? `${row.width}×${row.height} · ` : ""}
                  {formatBytes(row.bytes)}
                </p>
                {rowError[row.key] && <p className="mt-1 text-[10px] text-red-700">{rowError[row.key]}</p>}
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
                        if (file) handleReplace(row, file);
                      }}
                    />
                  </label>
                  <button
                    onClick={() => handleDelete(row)}
                    disabled={busy}
                    className="flex-1 rounded-full border border-charcoal/20 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
