"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TEMPLATES,
  getTemplate,
  makePage,
  type MagPage,
  type Photo,
} from "@/lib/magazine/templates";
import PageCanvas from "@/components/magazine/PageCanvas";

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export default function MagazineBuilder() {
  const [photos, setPhotos] = useState<Record<string, Photo>>({});
  const [photoOrder, setPhotoOrder] = useState<string[]>([]);
  const [pages, setPages] = useState<MagPage[]>([makePage("cover-withyou")]);
  const [current, setCurrent] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [exporting, setExporting] = useState(false);

  const page = pages[current];
  const tpl = getTemplate(page.templateId);

  /* ---- photos ---- */
  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    const added: Photo[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await readAsDataUrl(file);
      added.push({ id: `ph_${Math.random().toString(36).slice(2, 9)}`, dataUrl, name: file.name });
    }
    setPhotos((p) => ({ ...p, ...Object.fromEntries(added.map((a) => [a.id, a])) }));
    setPhotoOrder((o) => [...o, ...added.map((a) => a.id)]);
  }

  function assignPhoto(photoId: string) {
    if (selectedSlot === null) return;
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        const next = [...pg.photoIds];
        next[selectedSlot] = photoId;
        return { ...pg, photoIds: next };
      })
    );
    // auto-advance to the next empty slot for quick filling
    const next = tpl.slots.findIndex(
      (_, idx) => idx > selectedSlot && !pages[current].photoIds[idx]
    );
    setSelectedSlot(next === -1 ? selectedSlot : next);
  }

  function clearSlot() {
    if (selectedSlot === null) return;
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        const next = [...pg.photoIds];
        next[selectedSlot] = null;
        return { ...pg, photoIds: next };
      })
    );
  }

  /* ---- pages ---- */
  function applyTemplate(templateId: string) {
    setPages((ps) => ps.map((pg, i) => (i === current ? makePage(templateId, pg) : pg)));
    setSelectedSlot(0);
  }
  function addPage() {
    setPages((ps) => {
      const next = [...ps, makePage("letterbox3")];
      setCurrent(next.length - 1);
      return next;
    });
    setSelectedSlot(0);
  }
  function deletePage(idx: number) {
    if (pages.length === 1) return;
    setPages((ps) => ps.filter((_, i) => i !== idx));
    setCurrent((c) => Math.max(0, c >= idx ? c - 1 : c));
  }
  function setText(blockId: string, value: string) {
    setPages((ps) =>
      ps.map((pg, i) =>
        i === current ? { ...pg, texts: { ...pg.texts, [blockId]: value } } : pg
      )
    );
  }

  /* ---- export ---- */
  async function handleExport() {
    setExporting(true);
    try {
      const { downloadMagazinePdf } = await import("@/components/magazine/MagazinePdf");
      await downloadMagazinePdf(pages, photos);
    } catch (e) {
      console.error(e);
      alert("PDF banane me dikkat aayi. Console check karein.");
    } finally {
      setExporting(false);
    }
  }

  const totalFilled = pages.reduce((n, pg) => n + pg.photoIds.filter(Boolean).length, 0);

  return (
    <main className="min-h-screen bg-[#F9F9EA] text-[#1a1a1a]">
      {/* Toolbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-charcoal/10 bg-[#F9F9EA]/90 px-4 py-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-charcoal"
          >
            ← Home
          </Link>
          <div className="h-5 w-px bg-charcoal/10" />
          <div>
            <h1 className="font-display text-xl italic leading-none md:text-2xl">Magazine Studio</h1>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">
              {pages.length} pages · {totalFilled} photos placed
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting || totalFilled === 0}
          className="rounded-full bg-charcoal px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cream transition-opacity disabled:opacity-40 md:px-7"
        >
          {exporting ? "Preparing…" : "Download PDF →"}
        </button>
      </header>

      <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-6 p-4 md:p-8 lg:grid-cols-12">
        {/* Left — templates */}
        <aside className="lg:col-span-3">
          <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
            Layouts
          </h2>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className={`overflow-hidden rounded-md border p-1.5 transition-all ${
                  page.templateId === t.id
                    ? "border-gold ring-1 ring-gold"
                    : "border-charcoal/10 hover:border-charcoal/30"
                }`}
                title={t.name}
              >
                <div className="pointer-events-none">
                  <PageCanvas page={makePage(t.id)} photos={{}} />
                </div>
                <span className="mt-1.5 block truncate text-[8px] font-bold uppercase tracking-[0.15em] text-zinc-500">
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center — current page */}
        <section className="lg:col-span-6">
          <div className="mx-auto max-w-[440px]">
            <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
              Page {current + 1} · {tpl.name}
            </p>
            <PageCanvas
              page={page}
              photos={photos}
              interactive
              selectedSlot={selectedSlot}
              onSlotClick={setSelectedSlot}
              onTextChange={setText}
            />
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={clearSlot}
                disabled={selectedSlot === null || !page.photoIds[selectedSlot ?? 0]}
                className="rounded-full border border-charcoal/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 transition-colors hover:border-charcoal disabled:opacity-30"
              >
                Clear slot
              </button>
              <button
                onClick={() => deletePage(current)}
                disabled={pages.length === 1}
                className="rounded-full border border-charcoal/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-30"
              >
                Delete page
              </button>
            </div>
          </div>
        </section>

        {/* Right — photo tray */}
        <aside className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
              Your photos
            </h2>
            <label className="cursor-pointer rounded-full bg-charcoal px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-cream">
              + Upload
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
            {selectedSlot !== null
              ? "Ab koi photo pe click karo — wo selected slot me lag jayegi."
              : "Page pe ek slot select karo, fir photo choose karo."}
          </p>

          {photoOrder.length === 0 ? (
            <label className="mt-4 flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-charcoal/15 text-center text-zinc-400 transition-colors hover:border-charcoal/30">
              <span className="text-2xl">↑</span>
              <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
                Upload photos
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>
          ) : (
            <div className="mt-4 grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto pr-1">
              {photoOrder.map((id) => (
                <button
                  key={id}
                  onClick={() => assignPhoto(id)}
                  disabled={selectedSlot === null}
                  className="relative aspect-square overflow-hidden rounded-md border border-charcoal/10 transition-transform hover:scale-[1.03] disabled:cursor-not-allowed"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photos[id].dataUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* Pages strip */}
      <div className="sticky bottom-0 z-30 border-t border-charcoal/10 bg-[#F9F9EA]/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex max-w-[1700px] items-center gap-3 overflow-x-auto">
          {pages.map((pg, i) => (
            <button
              key={pg.id}
              onClick={() => {
                setCurrent(i);
                setSelectedSlot(0);
              }}
              className={`relative w-14 shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === current ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <PageCanvas page={pg} photos={photos} />
              <span className="absolute left-0 top-0 bg-black/50 px-1 text-[8px] font-bold text-cream">
                {i + 1}
              </span>
            </button>
          ))}
          <button
            onClick={addPage}
            className="flex h-[78px] w-14 shrink-0 items-center justify-center rounded border-2 border-dashed border-charcoal/20 text-xl text-zinc-400 transition-colors hover:border-charcoal/40 hover:text-charcoal"
            title="Add page"
          >
            +
          </button>
        </div>
      </div>
    </main>
  );
}
