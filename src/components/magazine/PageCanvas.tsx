"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  PAGE,
  THEMES,
  PREVIEW_FONT,
  getTemplate,
  coverRatios,
  DEFAULT_FOCUS,
  type MagPage,
  type Photo,
  type TextBlock,
  type Theme,
  type Focus,
} from "@/lib/magazine/templates";

interface Props {
  page: MagPage;
  photos: Record<string, Photo>;
  /** Enables slot selection, placeholders and text editing. Off for thumbnails. */
  interactive?: boolean;
  selectedSlot?: number | null;
  onSlotClick?: (slotIndex: number) => void;
  onTextChange?: (blockId: string, value: string) => void;
  /** A photo was dragged from the tray and dropped on a slot. */
  onSlotDrop?: (slotIndex: number, photoId: string) => void;
  /** The photo inside a slot was panned (dragged to reposition the crop). */
  onFocusChange?: (slotIndex: number, focus: Focus) => void;
  /** Id of the selected text box — a template TextBlock id or a CustomTextBox id. */
  selectedText?: string | null;
  onTextSelect?: (id: string | null) => void;
  /** A text box (template or custom) was dragged to a new position. */
  onTextMove?: (id: string, x: number, y: number) => void;
  /** The whole text box (template or custom) should be removed. */
  onTextDelete?: (id: string) => void;
}

/** points → % of page width, as container-query units so text scales with the page. */
const cqw = (pt: number) => `${(pt / PAGE.w) * 100}cqw`;

/** MIME type used to identify a tray-photo drag in the browser's native DnD data. */
export const PHOTO_DRAG_MIME = "application/x-kahani-photo-id";

function resolveColor(c: TextBlock["color"], theme: Theme): string {
  switch (c) {
    case "text": return theme.text;
    case "sub": return theme.sub;
    case "accent": return theme.accent;
    case "onPhoto": return "#F9F9EA";
    case "onAccent": return theme.onAccent;
  }
}

export default function PageCanvas({
  page,
  photos,
  interactive = false,
  selectedSlot = null,
  onSlotClick,
  onTextChange,
  onSlotDrop,
  onFocusChange,
  selectedText = null,
  onTextSelect,
  onTextMove,
  onTextDelete,
}: Props) {
  const tpl = getTemplate(page.templateId);
  const theme = THEMES[tpl.theme];
  const gapPct = (tpl.gap / PAGE.w) * 100;
  const framePct = (5 / PAGE.w) * 100;
  const pageAR = tpl.aspect ?? PAGE.w / PAGE.h;
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={canvasRef}
      onClick={interactive ? () => onTextSelect?.(null) : undefined}
      className="relative w-full overflow-hidden select-none shadow-[0_10px_40px_rgba(0,0,0,0.14)]"
      style={{ aspectRatio: `${pageAR}`, background: theme.bg, containerType: "inline-size" }}
    >
      {/* Photos */}
      {tpl.slots.map((s, i) => {
        const photo = page.photoIds[i] ? photos[page.photoIds[i] as string] : undefined;
        const isSel = interactive && selectedSlot === i;
        const focus = page.focus[i] ?? DEFAULT_FOCUS;
        return (
          <div
            key={i}
            onClick={interactive ? () => onSlotClick?.(i) : undefined}
            onDragOver={interactive && onSlotDrop ? (e) => e.preventDefault() : undefined}
            onDrop={
              interactive && onSlotDrop
                ? (e) => {
                    e.preventDefault();
                    const photoId = e.dataTransfer.getData(PHOTO_DRAG_MIME);
                    if (photoId) onSlotDrop(i, photoId);
                  }
                : undefined
            }
            className={`absolute ${interactive ? "cursor-pointer" : ""}`}
            style={{
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              width: `${s.w * 100}%`,
              height: `${s.h * 100}%`,
              padding: `${gapPct / 2}%`,
            }}
          >
            <div
              className="relative w-full h-full"
              style={{
                background: s.frame ? theme.frame : "transparent",
                padding: s.frame ? `${framePct}%` : 0,
                boxShadow: s.frame ? "0 2px 10px rgba(0,0,0,0.12)" : "none",
                outline: isSel ? "2px solid #C9A24B" : "none",
                outlineOffset: "1px",
              }}
            >
              <div
                className="relative w-full h-full overflow-hidden"
                style={{ background: photo ? "transparent" : "rgba(0,0,0,0.06)" }}
              >
                {photo ? (
                  <SlotPhoto
                    photo={photo}
                    focus={focus}
                    pannable={interactive && isSel && !!onFocusChange}
                    onPan={(next) => onFocusChange?.(i, next)}
                  />
                ) : (
                  interactive && (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: theme.sub }}>
                      <span style={{ fontSize: cqw(28), fontWeight: 300 }}>+</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Bottom scrim for over-photo titles */}
      {tpl.scrim && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: "42%", background: "linear-gradient(to top, rgba(0,0,0,0.62), transparent)" }}
        />
      )}

      {/* Fixed branding logos */}
      {tpl.logos?.map((l, i) => (
        <div
          key={`logo${i}`}
          className="absolute"
          style={{ left: `${l.x * 100}%`, top: `${l.y * 100}%`, width: `${l.w * 100}%`, height: `${l.h * 100}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={l.src} alt="" className="w-full h-full object-contain" />
        </div>
      ))}

      {/* Decorative rules */}
      {tpl.rules?.map((r, i) => (
        <div
          key={`r${i}`}
          className="absolute"
          style={{
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
            width: `${r.w * 100}%`,
            height: 1,
            background: theme.accent,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Template text blocks — position draggable via textPos override */}
      {tpl.texts.map((t) => {
        if (page.hiddenTexts.includes(t.id)) return null;
        const color = resolveColor(t.color, theme);
        const pos = page.textPos[t.id] ?? { x: t.x, y: t.y };
        const common: React.CSSProperties = {
          fontFamily: PREVIEW_FONT[t.style],
          fontStyle: t.style === "serif-italic" ? "italic" : "normal",
          fontWeight: t.style === "display" ? 600 : t.style === "label" ? 700 : 400,
          fontSize: cqw(t.size),
          letterSpacing: t.tracking ? cqw(t.tracking) : undefined,
          textTransform: t.upper ? "uppercase" : "none",
          textAlign: t.align,
          color: t.box ? t.color === "onAccent" ? theme.onAccent : color : color,
          lineHeight: 1.25,
        };
        return (
          <TextBoxFrame
            key={t.id}
            id={t.id}
            x={pos.x}
            y={pos.y}
            w={t.w}
            h={t.h}
            align={t.align}
            interactive={interactive}
            selected={interactive && selectedText === t.id}
            canvasRef={canvasRef}
            onSelect={() => onTextSelect?.(t.id)}
            onMove={(x, y) => onTextMove?.(t.id, x, y)}
            onDelete={onTextDelete ? () => onTextDelete(t.id) : undefined}
          >
            <div
              className="w-full"
              style={t.box ? { background: theme.accent, padding: `${cqw(6)} ${cqw(10)}` } : undefined}
            >
              {interactive ? (
                t.multiline ? (
                  <textarea
                    value={page.texts[t.id] ?? ""}
                    onChange={(e) => onTextChange?.(t.id, e.target.value)}
                    placeholder={t.placeholder}
                    rows={3}
                    className="w-full bg-transparent outline-none resize-none placeholder:opacity-40"
                    style={{ ...common, height: "100%" }}
                  />
                ) : (
                  <input
                    value={page.texts[t.id] ?? ""}
                    onChange={(e) => onTextChange?.(t.id, e.target.value)}
                    placeholder={t.placeholder}
                    className="w-full bg-transparent outline-none placeholder:opacity-40"
                    style={common}
                  />
                )
              ) : (
                <p className="w-full whitespace-pre-wrap" style={common}>
                  {page.texts[t.id] ?? ""}
                </p>
              )}
            </div>
          </TextBoxFrame>
        );
      })}

      {/* User-added free text boxes */}
      {page.customTexts.map((c) => {
        const color = resolveColor(c.color, theme);
        const common: React.CSSProperties = {
          fontFamily: PREVIEW_FONT[c.style],
          fontStyle: c.style === "serif-italic" ? "italic" : "normal",
          fontWeight: c.style === "display" ? 600 : c.style === "label" ? 700 : 400,
          fontSize: cqw(c.size),
          textAlign: c.align,
          color,
          lineHeight: 1.25,
        };
        return (
          <TextBoxFrame
            key={c.id}
            id={c.id}
            x={c.x}
            y={c.y}
            w={c.w}
            h={c.h}
            align={c.align}
            interactive={interactive}
            selected={interactive && selectedText === c.id}
            canvasRef={canvasRef}
            onSelect={() => onTextSelect?.(c.id)}
            onMove={(x, y) => onTextMove?.(c.id, x, y)}
            onDelete={onTextDelete ? () => onTextDelete(c.id) : undefined}
          >
            {interactive ? (
              <textarea
                value={c.text}
                onChange={(e) => onTextChange?.(c.id, e.target.value)}
                rows={2}
                className="w-full h-full bg-transparent outline-none resize-none placeholder:opacity-40"
                style={common}
              />
            ) : (
              <p className="w-full whitespace-pre-wrap" style={common}>
                {c.text}
              </p>
            )}
          </TextBoxFrame>
        );
      })}
    </div>
  );
}

/** Positions a text box (template or custom) and, when selected, shows a
 * drag handle to move it and — for custom boxes — a delete button. */
function TextBoxFrame({
  x,
  y,
  w,
  h,
  align,
  interactive,
  selected,
  canvasRef,
  onSelect,
  onMove,
  onDelete,
  children,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  align: "left" | "center" | "right";
  interactive: boolean;
  selected: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onDelete?: () => void;
  children: React.ReactNode;
}) {
  const drag = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, x, y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = (e.clientX - drag.current.startX) / rect.width;
    const dy = (e.clientY - drag.current.startY) / rect.height;
    const nextX = clamp(drag.current.x + dx, 0, Math.max(0, 1 - w));
    const nextY = clamp(drag.current.y + dy, 0, Math.max(0, 1 - h));
    onMove(nextX, nextY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  return (
    <div
      className="absolute flex"
      onClick={
        interactive
          ? (e) => {
              e.stopPropagation();
              onSelect();
            }
          : undefined
      }
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${w * 100}%`,
        height: `${h * 100}%`,
        alignItems: "flex-start",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        outline: selected ? "1.5px dashed #C9A24B" : "none",
        outlineOffset: "3px",
      }}
    >
      {children}
      {selected && (
        <>
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            title="Drag to move"
            className="absolute -top-3 -left-3 z-10 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-charcoal text-[10px] text-cream active:cursor-grabbing"
          >
            ✥
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete text box"
              className="absolute -top-3 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
            >
              ✕
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** A photo cropped to cover its slot per `focus`, draggable to pan when selected. */
function SlotPhoto({
  photo,
  focus,
  pannable,
  onPan,
}: {
  photo: Photo;
  focus: Focus;
  pannable: boolean;
  onPan: (next: Focus) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; focus: Focus } | null>(null);
  // Measured live rather than computed from the template's slot fractions:
  // CSS percentage padding (gap + frame mat) always resolves against the
  // container's WIDTH for every side, so the slot's actual rendered aspect
  // ratio diverges from the analytical (s.w/s.h)*pageAR value — a gap that
  // compounds at higher zoom until the crop pushes fully out of view.
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const slotAR = box && box.h > 0 ? box.w / box.h : 1;
  const imgAR = photo.width / photo.height;
  const { ratioW, ratioH } = coverRatios(imgAR, slotAR, focus.zoom);

  const widthPct = ratioW * 100;
  const heightPct = ratioH * 100;
  const leftPct = (0.5 - focus.x * ratioW) * 100;
  const topPct = (0.5 - focus.y * ratioH) * 100;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!pannable) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, focus };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const dxFrac = (e.clientX - drag.current.startX) / rect.width;
    const dyFrac = (e.clientY - drag.current.startY) / rect.height;
    const minX = 0.5 - 0.5 / ratioW;
    const minY = 0.5 - 0.5 / ratioH;
    const nextX = clamp(drag.current.focus.x - dxFrac / ratioW, minX, 1 - minX);
    const nextY = clamp(drag.current.focus.y - dyFrac / ratioH, minY, 1 - minY);
    onPan({ ...focus, x: nextX, y: nextY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drag.current) return;
    (e.target as Element).releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  return (
    <div
      ref={wrapRef}
      className={`relative w-full h-full ${pannable ? "cursor-grab active:cursor-grabbing" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.dataUrl}
        alt=""
        draggable={false}
        className="absolute pointer-events-none"
        style={{
          width: `${widthPct}%`,
          height: `${heightPct}%`,
          left: `${leftPct}%`,
          top: `${topPct}%`,
          maxWidth: "none",
          maxHeight: "none",
        }}
      />
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return min > max ? 0.5 : Math.min(max, Math.max(min, v));
}
