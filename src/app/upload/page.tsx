"use client";

import { useRef, useState } from "react";

type Phase = "idle" | "signing" | "uploading" | "done" | "error";

type SignResponse = {
  ok: boolean;
  code?: string;
  error?: string;
  cloudName?: string;
  apiKey?: string;
  timestamp?: number;
  folder?: string;
  signature?: string;
};

const VIDEO_EXT = /\.(mp4|mov|webm|m4v|avi|mkv)$/i;

/* Cloudinary can render a poster frame from the video: insert a transform
 * after /upload/ and swap the extension to .jpg. */
function posterFrom(videoUrl: string) {
  return videoUrl
    .replace("/upload/", "/upload/so_0,w_720,q_auto/")
    .replace(VIDEO_EXT, ".jpg");
}

function slugify(name: string) {
  return name
    .replace(VIDEO_EXT, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "reel";
}

export default function UploadPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [passcode, setPasscode] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const busy = phase === "signing" || phase === "uploading";

  async function handleFile(file: File) {
    setError("");
    setVideoUrl("");
    setPosterUrl("");
    setProgress(0);
    setFileName(file.name);

    // Cloudinary's free plan caps each video at 100MB. Catch it here so we
    // don't burn a long upload just to be rejected — compress first instead.
    const MAX = 100 * 1024 * 1024;
    if (file.size > MAX) {
      setPhase("error");
      setError(
        `This video is ${(file.size / 1024 / 1024).toFixed(0)}MB. Cloudinary's free plan caps videos at 100MB — compress it first (a web reel should be ~5–15MB).`
      );
      return;
    }

    // 1. Ask our server to sign the upload.
    setPhase("signing");
    let sign: SignResponse;
    try {
      const res = await fetch("/api/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      sign = (await res.json()) as SignResponse;
      if (!res.ok || !sign.ok) {
        setPhase("error");
        setError(sign.error || "Could not start the upload.");
        return;
      }
    } catch {
      setPhase("error");
      setError("Network issue reaching the server. Try again.");
      return;
    }

    // 2. Upload to Cloudinary in chunks. The single-shot endpoint drops the
    //    connection past ~100MB (free plan), which phone reels easily exceed,
    //    so we always chunk — same signed params on every chunk.
    setPhase("uploading");
    const endpoint = `https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`;
    const CHUNK = 20 * 1024 * 1024; // 20MB
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const total = file.size;

    try {
      let secureUrl = "";
      for (let start = 0; start < total; start += CHUNK) {
        const end = Math.min(start + CHUNK, total);
        const form = new FormData();
        form.append("file", file.slice(start, end));
        form.append("api_key", sign.apiKey!);
        form.append("timestamp", String(sign.timestamp));
        form.append("signature", sign.signature!);
        form.append("folder", sign.folder!);

        const data = await new Promise<{ secure_url?: string }>(
          (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", endpoint);
            xhr.setRequestHeader("X-Unique-Upload-Id", uid);
            xhr.setRequestHeader(
              "Content-Range",
              `bytes ${start}-${end - 1}/${total}`
            );
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                setProgress(Math.round(((start + e.loaded) / total) * 100));
              }
            };
            xhr.onload = () => {
              try {
                const json = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300) resolve(json);
                else
                  reject(
                    new Error(json?.error?.message || `Upload failed (${xhr.status}).`)
                  );
              } catch {
                reject(new Error("Unexpected response from Cloudinary."));
              }
            };
            xhr.onerror = () => reject(new Error("Network error during upload."));
            xhr.send(form);
          }
        );

        if (data.secure_url) secureUrl = data.secure_url;
      }

      if (!secureUrl) throw new Error("Upload finished without a URL.");
      setProgress(100);
      setVideoUrl(secureUrl);
      setPosterUrl(posterFrom(secureUrl));
      setPhase("done");
    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  const snippet = videoUrl
    ? `{ id: "${slugify(fileName)}", title: "Your Title", tag: "Wedding Film", src: "${videoUrl}", poster: "${posterUrl}" },`
    : "";

  return (
    <main className="min-h-screen bg-[#F9F9EA] text-[#1a1a1a] px-5 py-16 sm:px-8 md:py-24">
      <div className="mx-auto w-full max-w-2xl">
        <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 block mb-4">
          Internal · Reel uploader
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display tracking-tight mb-3">
          Upload a <span className="italic">reel.</span>
        </h1>
        <p className="text-sm text-zinc-500 mb-10 leading-relaxed">
          Pick a video — it uploads straight to Cloudinary and gives you a link
          to paste into{" "}
          <code className="text-charcoal">src/components/Reels.tsx</code>.
        </p>

        {/* Passcode (only needed if UPLOAD_PASSCODE is set) */}
        <label className="block mb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Passcode <span className="normal-case tracking-normal">(if set)</span>
          </span>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            disabled={busy}
            className="mt-2 w-full bg-transparent border border-black rounded-lg px-3 py-2.5 text-base outline-none focus:ring-1 focus:ring-black disabled:opacity-50"
            placeholder="leave blank if not required"
          />
        </label>

        {/* Drop / pick zone */}
        <button
          type="button"
          onClick={() => !busy && inputRef.current?.click()}
          disabled={busy}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (busy) return;
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className="w-full rounded-2xl border-2 border-dashed border-black/30 hover:border-black/60 transition-colors p-10 text-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <p className="text-lg font-display italic">
            {fileName || "Drop a video here, or click to choose"}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-zinc-400">
            MP4 · MOV · WEBM
          </p>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {/* Progress */}
        {busy && (
          <div className="mt-8">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">
              <span>{phase === "signing" ? "Preparing…" : "Uploading…"}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-charcoal transition-[width] duration-200"
                style={{ width: `${phase === "signing" ? 5 : progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <p className="mt-8 text-sm text-red-700">{error}</p>
        )}

        {/* Result */}
        {phase === "done" && videoUrl && (
          <div className="mt-10 space-y-6">
            <video
              src={videoUrl}
              poster={posterUrl}
              controls
              playsInline
              className="w-full max-w-xs mx-auto rounded-2xl border border-black/10 aspect-[9/16] object-cover bg-black"
            />

            <Field label="Video URL (src)" value={videoUrl} />
            <Field label="Poster URL" value={posterUrl} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                  Paste into the REELS array
                </span>
                <CopyButton value={snippet} />
              </div>
              <pre className="text-[11px] leading-relaxed bg-charcoal text-cream rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-all">
                {snippet}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => {
                setPhase("idle");
                setFileName("");
                setVideoUrl("");
                setPosterUrl("");
                setProgress(0);
              }}
              className="text-[10px] font-bold uppercase tracking-[0.4em] underline underline-offset-8 hover:italic"
            >
              Upload another
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
          {label}
        </span>
        <CopyButton value={value} />
      </div>
      <input
        readOnly
        value={value}
        onFocus={(e) => e.currentTarget.select()}
        className="w-full bg-white/60 border border-black/10 rounded-lg px-3 py-2.5 text-xs font-mono outline-none"
      />
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked — user can select manually */
        }
      }}
      className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal hover:italic"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}
