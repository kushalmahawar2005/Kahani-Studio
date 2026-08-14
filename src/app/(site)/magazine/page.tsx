"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TEMPLATES,
  FONT_FAMILY_OPTIONS,
  WEIGHT_OPTIONS,
  TEXT_SIZE_MIN,
  TEXT_SIZE_MAX,
  styleToFontChoice,
  getTemplate,
  makePage,
  makeCustomTextBox,
  DEFAULT_FOCUS,
  type MagPage,
  type Photo,
  type Focus,
  type FontFamily,
  type FontWeight,
} from "@/lib/magazine/templates";
import { normalizeImage } from "@/lib/magazine/normalizeImage";
import PageCanvas, { PHOTO_DRAG_MIME } from "@/components/magazine/PageCanvas";
import InstagramStudio from "@/components/magazine/InstagramStudio";

export default function MagazineBuilder() {
  const [studioMode, setStudioMode] = useState<"magazine" | "instagram">("magazine");
  const [photos, setPhotos] = useState<Record<string, Photo>>({});
  const [photoOrder, setPhotoOrder] = useState<string[]>([]);
  const [pages, setPages] = useState<MagPage[]>([makePage("cover-withyou")]);
  const [current, setCurrent] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [trayDragOver, setTrayDragOver] = useState(false);

  const page = pages[current];
  const tpl = getTemplate(page.templateId);
  const selectedPhotoId = selectedSlot !== null ? page.photoIds[selectedSlot] : null;
  const selectedFocus =
    selectedSlot !== null ? page.focus[selectedSlot] ?? DEFAULT_FOCUS : DEFAULT_FOCUS;
  const selectedTemplateText = selectedText ? tpl.texts.find((t) => t.id === selectedText) : undefined;
  const selectedCustomText = selectedText ? page.customTexts.find((c) => c.id === selectedText) : undefined;
  const selectedFontChoice = selectedCustomText
    ? { family: selectedCustomText.family, weight: selectedCustomText.weight }
    : selectedTemplateText
    ? page.textFont[selectedTemplateText.id] ?? styleToFontChoice(selectedTemplateText.style)
    : undefined;
  const selectedFontSize = selectedCustomText
    ? selectedCustomText.size
    : selectedTemplateText
    ? page.textSize[selectedTemplateText.id] ?? selectedTemplateText.size
    : undefined;

  /* ---- photos ---- */
  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    const added: Photo[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const { dataUrl, width, height } = await normalizeImage(file);
        added.push({
          id: `ph_${Math.random().toString(36).slice(2, 9)}`,
          dataUrl,
          width,
          height,
          name: file.name,
        });
      } catch (err) {
        console.error(err);
      }
    }
    setPhotos((p) => ({ ...p, ...Object.fromEntries(added.map((a) => [a.id, a])) }));
    setPhotoOrder((o) => [...o, ...added.map((a) => a.id)]);
  }

  function assignPhotoToSlot(slotIndex: number, photoId: string) {
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        const next = [...pg.photoIds];
        next[slotIndex] = photoId;
        // dropping a new photo into an already-cropped slot resets the crop
        const focus = { ...pg.focus };
        delete focus[slotIndex];
        return { ...pg, photoIds: next, focus };
      })
    );
  }

  /** Click-to-assign flow: uses the selected slot, then auto-advances to
   * the next empty one for quick filling. */
  function assignPhoto(photoId: string) {
    if (selectedSlot === null) return;
    assignPhotoToSlot(selectedSlot, photoId);
    const next = tpl.slots.findIndex(
      (_, idx) => idx > selectedSlot && !pages[current].photoIds[idx]
    );
    setSelectedSlot(next === -1 ? selectedSlot : next);
  }

  function setFocus(slotIndex: number, focus: Focus) {
    setPages((ps) =>
      ps.map((pg, i) =>
        i === current ? { ...pg, focus: { ...pg.focus, [slotIndex]: focus } } : pg
      )
    );
  }

  function resetCrop() {
    if (selectedSlot === null) return;
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        const focus = { ...pg.focus };
        delete focus[selectedSlot];
        return { ...pg, focus };
      })
    );
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
  /** Handles both template TextBlocks (stored in pg.texts) and user-added
   * CustomTextBoxes (which carry their own .text field). */
  function setText(id: string, value: string) {
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        if (pg.customTexts.some((c) => c.id === id)) {
          return {
            ...pg,
            customTexts: pg.customTexts.map((c) => (c.id === id ? { ...c, text: value } : c)),
          };
        }
        return { ...pg, texts: { ...pg.texts, [id]: value } };
      })
    );
  }

  function moveText(id: string, x: number, y: number) {
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        if (pg.customTexts.some((c) => c.id === id)) {
          return {
            ...pg,
            customTexts: pg.customTexts.map((c) => (c.id === id ? { ...c, x, y } : c)),
          };
        }
        return { ...pg, textPos: { ...pg.textPos, [id]: { x, y } } };
      })
    );
  }

  function setTextFamily(id: string, family: FontFamily) {
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        if (pg.customTexts.some((c) => c.id === id)) {
          return {
            ...pg,
            customTexts: pg.customTexts.map((c) => (c.id === id ? { ...c, family } : c)),
          };
        }
        const tb = tpl.texts.find((t) => t.id === id);
        const choice = pg.textFont[id] ?? (tb ? styleToFontChoice(tb.style) : { family: "sans" as const, weight: "regular" as const });
        return { ...pg, textFont: { ...pg.textFont, [id]: { ...choice, family } } };
      })
    );
  }

  function setTextWeight(id: string, weight: FontWeight) {
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        if (pg.customTexts.some((c) => c.id === id)) {
          return {
            ...pg,
            customTexts: pg.customTexts.map((c) => (c.id === id ? { ...c, weight } : c)),
          };
        }
        const tb = tpl.texts.find((t) => t.id === id);
        const choice = pg.textFont[id] ?? (tb ? styleToFontChoice(tb.style) : { family: "sans" as const, weight: "regular" as const });
        return { ...pg, textFont: { ...pg.textFont, [id]: { ...choice, weight } } };
      })
    );
  }

  function setTextFontSize(id: string, size: number) {
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        if (pg.customTexts.some((c) => c.id === id)) {
          return {
            ...pg,
            customTexts: pg.customTexts.map((c) => (c.id === id ? { ...c, size } : c)),
          };
        }
        return { ...pg, textSize: { ...pg.textSize, [id]: size } };
      })
    );
  }

  function addCustomText() {
    const box = makeCustomTextBox();
    setPages((ps) =>
      ps.map((pg, i) => (i === current ? { ...pg, customTexts: [...pg.customTexts, box] } : pg))
    );
    setSelectedSlot(null);
    setSelectedText(box.id);
  }

  /** Removes a text box entirely — a custom box is dropped from the array;
   * a template TextBlock has no array to drop from, so it's hidden instead. */
  function deleteText(id: string) {
    setPages((ps) =>
      ps.map((pg, i) => {
        if (i !== current) return pg;
        if (pg.customTexts.some((c) => c.id === id)) {
          return { ...pg, customTexts: pg.customTexts.filter((c) => c.id !== id) };
        }
        return { ...pg, hiddenTexts: [...pg.hiddenTexts, id] };
      })
    );
    setSelectedText((s) => (s === id ? null : s));
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
            <h1 className="font-display text-xl italic leading-none md:text-2xl">Studio</h1>
            {studioMode === "magazine" && (
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400">
                {pages.length} pages · {totalFilled} photos placed
              </p>
            )}
          </div>
          <div className="ml-2 flex items-center rounded-full border border-charcoal/10 bg-white/60 p-1">
            <button
              onClick={() => setStudioMode("magazine")}
              className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] transition-colors ${
                studioMode === "magazine" ? "bg-charcoal text-cream" : "text-zinc-500 hover:text-charcoal"
              }`}
            >
              Magazine
            </button>
            <button
              onClick={() => setStudioMode("instagram")}
              className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] transition-colors ${
                studioMode === "instagram" ? "bg-charcoal text-cream" : "text-zinc-500 hover:text-charcoal"
              }`}
            >
              Instagram Posts
            </button>
          </div>
        </div>
        {studioMode === "magazine" && (
          <button
            onClick={handleExport}
            disabled={exporting || totalFilled === 0}
            className="rounded-full bg-charcoal px-5 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cream transition-opacity disabled:opacity-40 md:px-7"
          >
            {exporting ? "Preparing…" : "Download PDF →"}
          </button>
        )}
      </header>

      {studioMode === "instagram" ? (
        <InstagramStudio photos={photos} photoOrder={photoOrder} onUpload={handleUpload} />
      ) : (
      <>
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
            <div className="mb-3 flex h-9 items-center justify-center">
              {selectedText && selectedFontChoice !== undefined && selectedFontSize !== undefined && (
                <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-charcoal/10 bg-white/70 px-2 py-1.5">
                  <select
                    value={selectedFontChoice.family}
                    onChange={(e) => setTextFamily(selectedText, e.target.value as FontFamily)}
                    className="rounded-full border border-charcoal/15 bg-transparent px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-700 outline-none"
                  >
                    {FONT_FAMILY_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedFontChoice.weight}
                    onChange={(e) => setTextWeight(selectedText, e.target.value as FontWeight)}
                    className="rounded-full border border-charcoal/15 bg-transparent px-2 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-700 outline-none"
                  >
                    {WEIGHT_OPTIONS.map((w) => (
                      <option key={w.value} value={w.value}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTextFontSize(selectedText, Math.max(TEXT_SIZE_MIN, selectedFontSize - 1))}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-zinc-600 hover:bg-charcoal/10"
                      title="Smaller"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-[9px] font-bold text-zinc-600">
                      {Math.round(selectedFontSize)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTextFontSize(selectedText, Math.min(TEXT_SIZE_MAX, selectedFontSize + 1))}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-zinc-600 hover:bg-charcoal/10"
                      title="Bigger"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
            <PageCanvas
              page={page}
              photos={photos}
              interactive
              selectedSlot={selectedSlot}
              onSlotClick={(i) => {
                setSelectedSlot(i);
                setSelectedText(null);
              }}
              onTextChange={setText}
              onSlotDrop={assignPhotoToSlot}
              onFocusChange={setFocus}
              selectedText={selectedText}
              onTextSelect={(id) => {
                setSelectedText(id);
                if (id) setSelectedSlot(null);
              }}
              onTextMove={moveText}
              onTextDelete={deleteText}
            />

            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                onClick={addCustomText}
                className="rounded-full border border-charcoal/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 transition-colors hover:border-charcoal"
              >
                + Add text
              </button>
              {selectedText && (
                <button
                  onClick={() => setText(selectedText, "")}
                  className="rounded-full border border-charcoal/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 transition-colors hover:border-charcoal"
                >
                  Clear text
                </button>
              )}
            </div>
            {selectedText && (
              <p className="mt-1 text-center text-[10px] text-zinc-400">
                Drag the ✥ handle to move, or ✕ to delete this text box.
              </p>
            )}

            {selectedPhotoId && (
              <div className="mt-4 flex items-center gap-3 rounded-full border border-charcoal/10 bg-white/60 px-4 py-2.5">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 shrink-0">
                  Zoom
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={selectedFocus.zoom}
                  onChange={(e) =>
                    selectedSlot !== null &&
                    setFocus(selectedSlot, { ...selectedFocus, zoom: Number(e.target.value) })
                  }
                  className="flex-1 accent-charcoal"
                />
                <button
                  onClick={resetCrop}
                  className="shrink-0 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 underline underline-offset-4 hover:text-charcoal"
                >
                  Reset
                </button>
              </div>
            )}
            <p className="mt-2 text-center text-[10px] text-zinc-400">
              {selectedPhotoId ? "Drag the photo to reposition it in its frame." : ""}
            </p>

            <div className="mt-2 flex items-center justify-center gap-3">
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
            Drag a photo straight onto a slot, or click a slot then click a
            photo. Drop files here too.
          </p>

          <div
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes("Files")) {
                e.preventDefault();
                setTrayDragOver(true);
              }
            }}
            onDragLeave={() => setTrayDragOver(false)}
            onDrop={(e) => {
              if (!e.dataTransfer.types.includes("Files")) return;
              e.preventDefault();
              setTrayDragOver(false);
              handleUpload(e.dataTransfer.files);
            }}
          >
            {photoOrder.length === 0 ? (
              <label
                className={`mt-4 flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${
                  trayDragOver
                    ? "border-gold bg-gold/5 text-charcoal"
                    : "border-charcoal/15 text-zinc-400 hover:border-charcoal/30"
                }`}
              >
                <span className="text-2xl">↑</span>
                <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
                  Drop or click to upload
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
              <div
                className={`mt-4 grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto rounded-lg pr-1 transition-colors ${
                  trayDragOver ? "outline outline-2 outline-gold outline-offset-4" : ""
                }`}
              >
                {photoOrder.map((id) => (
                  <button
                    key={id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(PHOTO_DRAG_MIME, id);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => assignPhoto(id)}
                    className="relative aspect-square cursor-grab overflow-hidden rounded-md border border-charcoal/10 transition-transform hover:scale-[1.03] active:cursor-grabbing"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photos[id].dataUrl} alt="" draggable={false} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
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
      </>
      )}
    </main>
  );
}
