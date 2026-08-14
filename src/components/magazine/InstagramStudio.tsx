"use client";

import { useRef, useState } from "react";
import {
  IG_TEMPLATES,
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
import { exportNodeAsPng } from "@/lib/magazine/exportImage";
import PageCanvas, { PHOTO_DRAG_MIME } from "@/components/magazine/PageCanvas";

interface Props {
  photos: Record<string, Photo>;
  photoOrder: string[];
  onUpload: (files: FileList | null) => void;
}

export default function InstagramStudio({ photos, photoOrder, onUpload }: Props) {
  const [posts, setPosts] = useState<MagPage[]>([makePage(IG_TEMPLATES[0].id)]);
  const [current, setCurrent] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(0);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [trayDragOver, setTrayDragOver] = useState(false);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  const post = posts[current];
  const tpl = getTemplate(post.templateId);
  const selectedPhotoId = selectedSlot !== null ? post.photoIds[selectedSlot] : null;
  const selectedFocus: Focus =
    selectedSlot !== null ? post.focus[selectedSlot] ?? DEFAULT_FOCUS : DEFAULT_FOCUS;
  const selectedTemplateText = selectedText ? tpl.texts.find((t) => t.id === selectedText) : undefined;
  const selectedCustomText = selectedText ? post.customTexts.find((c) => c.id === selectedText) : undefined;
  const selectedFontChoice = selectedCustomText
    ? { family: selectedCustomText.family, weight: selectedCustomText.weight }
    : selectedTemplateText
    ? post.textFont[selectedTemplateText.id] ?? styleToFontChoice(selectedTemplateText.style)
    : undefined;
  const selectedFontSize = selectedCustomText
    ? selectedCustomText.size
    : selectedTemplateText
    ? post.textSize[selectedTemplateText.id] ?? selectedTemplateText.size
    : undefined;

  function assignPhotoToSlot(slotIndex: number, photoId: string) {
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        const next = [...p.photoIds];
        next[slotIndex] = photoId;
        const focus = { ...p.focus };
        delete focus[slotIndex];
        return { ...p, photoIds: next, focus };
      })
    );
  }
  function assignPhoto(photoId: string) {
    if (selectedSlot === null) return;
    assignPhotoToSlot(selectedSlot, photoId);
  }
  function setFocus(slotIndex: number, focus: Focus) {
    setPosts((ps) =>
      ps.map((p, i) => (i === current ? { ...p, focus: { ...p.focus, [slotIndex]: focus } } : p))
    );
  }
  function resetCrop() {
    if (selectedSlot === null) return;
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        const focus = { ...p.focus };
        delete focus[selectedSlot];
        return { ...p, focus };
      })
    );
  }
  function clearSlot() {
    if (selectedSlot === null) return;
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        const next = [...p.photoIds];
        next[selectedSlot] = null;
        return { ...p, photoIds: next };
      })
    );
  }
  function applyTemplate(templateId: string) {
    setPosts((ps) => ps.map((p, i) => (i === current ? makePage(templateId, p) : p)));
    setSelectedSlot(0);
  }
  function addPost() {
    setPosts((ps) => {
      const next = [...ps, makePage(IG_TEMPLATES[0].id)];
      setCurrent(next.length - 1);
      return next;
    });
    setSelectedSlot(0);
  }
  function deletePost(idx: number) {
    if (posts.length === 1) return;
    setPosts((ps) => ps.filter((_, i) => i !== idx));
    setCurrent((c) => Math.max(0, c >= idx ? c - 1 : c));
  }
  function setText(id: string, value: string) {
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        if (p.customTexts.some((c) => c.id === id)) {
          return {
            ...p,
            customTexts: p.customTexts.map((c) => (c.id === id ? { ...c, text: value } : c)),
          };
        }
        return { ...p, texts: { ...p.texts, [id]: value } };
      })
    );
  }

  function moveText(id: string, x: number, y: number) {
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        if (p.customTexts.some((c) => c.id === id)) {
          return {
            ...p,
            customTexts: p.customTexts.map((c) => (c.id === id ? { ...c, x, y } : c)),
          };
        }
        return { ...p, textPos: { ...p.textPos, [id]: { x, y } } };
      })
    );
  }

  function setTextFamily(id: string, family: FontFamily) {
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        if (p.customTexts.some((c) => c.id === id)) {
          return {
            ...p,
            customTexts: p.customTexts.map((c) => (c.id === id ? { ...c, family } : c)),
          };
        }
        const tb = tpl.texts.find((t) => t.id === id);
        const choice = p.textFont[id] ?? (tb ? styleToFontChoice(tb.style) : { family: "sans" as const, weight: "regular" as const });
        return { ...p, textFont: { ...p.textFont, [id]: { ...choice, family } } };
      })
    );
  }

  function setTextWeight(id: string, weight: FontWeight) {
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        if (p.customTexts.some((c) => c.id === id)) {
          return {
            ...p,
            customTexts: p.customTexts.map((c) => (c.id === id ? { ...c, weight } : c)),
          };
        }
        const tb = tpl.texts.find((t) => t.id === id);
        const choice = p.textFont[id] ?? (tb ? styleToFontChoice(tb.style) : { family: "sans" as const, weight: "regular" as const });
        return { ...p, textFont: { ...p.textFont, [id]: { ...choice, weight } } };
      })
    );
  }

  function setTextFontSize(id: string, size: number) {
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        if (p.customTexts.some((c) => c.id === id)) {
          return {
            ...p,
            customTexts: p.customTexts.map((c) => (c.id === id ? { ...c, size } : c)),
          };
        }
        return { ...p, textSize: { ...p.textSize, [id]: size } };
      })
    );
  }

  function addCustomText() {
    const box = makeCustomTextBox();
    setPosts((ps) =>
      ps.map((p, i) => (i === current ? { ...p, customTexts: [...p.customTexts, box] } : p))
    );
    setSelectedSlot(null);
    setSelectedText(box.id);
  }

  /** Removes a text box entirely — a custom box is dropped from the array;
   * a template TextBlock has no array to drop from, so it's hidden instead. */
  function deleteText(id: string) {
    setPosts((ps) =>
      ps.map((p, i) => {
        if (i !== current) return p;
        if (p.customTexts.some((c) => c.id === id)) {
          return { ...p, customTexts: p.customTexts.filter((c) => c.id !== id) };
        }
        return { ...p, hiddenTexts: [...p.hiddenTexts, id] };
      })
    );
    setSelectedText((s) => (s === id ? null : s));
  }

  async function handleExport() {
    if (!canvasWrapRef.current) return;
    setExporting(true);
    try {
      const targetWidth = Math.round(1080 * (tpl.aspect && tpl.aspect < 1 ? tpl.aspect : 1));
      await exportNodeAsPng(canvasWrapRef.current, Math.max(targetWidth, 1080), `kahani-post-${current + 1}.png`);
    } catch (e) {
      console.error(e);
      alert("PNG banane me dikkat aayi. Console check karein.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-[1700px] grid-cols-1 gap-6 p-4 md:p-8 lg:grid-cols-12">
      {/* Left — layouts */}
      <aside className="lg:col-span-3">
        <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
          Post layouts
        </h2>
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
          {IG_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t.id)}
              className={`overflow-hidden rounded-md border p-1.5 transition-all ${
                post.templateId === t.id
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

      {/* Center — current post */}
      <section className="lg:col-span-6">
        <div className="mx-auto max-w-[380px]">
          <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
            Post {current + 1} · {tpl.name}
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
          <div ref={canvasWrapRef}>
            <PageCanvas
              page={post}
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
          </div>

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
              disabled={selectedSlot === null || !post.photoIds[selectedSlot ?? 0]}
              className="rounded-full border border-charcoal/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 transition-colors hover:border-charcoal disabled:opacity-30"
            >
              Clear slot
            </button>
            <button
              onClick={() => deletePost(current)}
              disabled={posts.length === 1}
              className="rounded-full border border-charcoal/20 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 transition-colors hover:border-red-500 hover:text-red-500 disabled:opacity-30"
            >
              Delete post
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="rounded-full bg-charcoal px-4 py-2 text-[9px] font-bold uppercase tracking-[0.3em] text-cream transition-opacity disabled:opacity-40"
            >
              {exporting ? "Preparing…" : "Download PNG →"}
            </button>
          </div>
        </div>
      </section>

      {/* Right — shared photo tray */}
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
              onChange={(e) => onUpload(e.target.files)}
            />
          </label>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
          Drag a photo straight onto the post, or click a slot then click a
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
            onUpload(e.dataTransfer.files);
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
                onChange={(e) => onUpload(e.target.files)}
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

      {/* Posts strip */}
      <div className="lg:col-span-12">
        <div className="mx-auto flex max-w-[1700px] items-center gap-3 overflow-x-auto border-t border-charcoal/10 pt-4">
          {posts.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                setCurrent(i);
                setSelectedSlot(0);
              }}
              className={`relative w-14 shrink-0 overflow-hidden rounded border-2 transition-all ${
                i === current ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <PageCanvas page={p} photos={photos} />
              <span className="absolute left-0 top-0 bg-black/50 px-1 text-[8px] font-bold text-cream">
                {i + 1}
              </span>
            </button>
          ))}
          <button
            onClick={addPost}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded border-2 border-dashed border-charcoal/20 text-xl text-zinc-400 transition-colors hover:border-charcoal/40 hover:text-charcoal"
            title="Add post"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
