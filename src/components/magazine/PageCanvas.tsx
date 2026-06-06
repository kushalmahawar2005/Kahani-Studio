"use client";

import {
  PAGE,
  THEMES,
  PREVIEW_FONT,
  getTemplate,
  type MagPage,
  type Photo,
  type TextBlock,
  type Theme,
} from "@/lib/magazine/templates";

interface Props {
  page: MagPage;
  photos: Record<string, Photo>;
  /** Enables slot selection, placeholders and text editing. Off for thumbnails. */
  interactive?: boolean;
  selectedSlot?: number | null;
  onSlotClick?: (slotIndex: number) => void;
  onTextChange?: (blockId: string, value: string) => void;
}

/** points → % of page width, as container-query units so text scales with the page. */
const cqw = (pt: number) => `${(pt / PAGE.w) * 100}cqw`;

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
}: Props) {
  const tpl = getTemplate(page.templateId);
  const theme = THEMES[tpl.theme];
  const gapPct = (tpl.gap / PAGE.w) * 100;
  const framePct = (5 / PAGE.w) * 100;

  return (
    <div
      className="relative w-full overflow-hidden select-none shadow-[0_10px_40px_rgba(0,0,0,0.14)]"
      style={{ aspectRatio: `${PAGE.w} / ${PAGE.h}`, background: theme.bg, containerType: "inline-size" }}
    >
      {/* Photos */}
      {tpl.slots.map((s, i) => {
        const photo = page.photoIds[i] ? photos[page.photoIds[i] as string] : undefined;
        const isSel = interactive && selectedSlot === i;
        return (
          <div
            key={i}
            onClick={interactive ? () => onSlotClick?.(i) : undefined}
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
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

      {/* Text blocks */}
      {tpl.texts.map((t) => {
        const color = resolveColor(t.color, theme);
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
          <div
            key={t.id}
            className="absolute flex"
            style={{
              left: `${t.x * 100}%`,
              top: `${t.y * 100}%`,
              width: `${t.w * 100}%`,
              height: `${t.h * 100}%`,
              alignItems: "flex-start",
              justifyContent: t.align === "center" ? "center" : t.align === "right" ? "flex-end" : "flex-start",
            }}
          >
            <div
              className="w-full"
              style={
                t.box
                  ? { background: theme.accent, padding: `${cqw(6)} ${cqw(10)}` }
                  : undefined
              }
            >
              {interactive ? (
                t.multiline ? (
                  <textarea
                    value={page.texts[t.id] ?? ""}
                    onChange={(e) => onTextChange?.(t.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={t.placeholder}
                    rows={3}
                    className="w-full bg-transparent outline-none resize-none placeholder:opacity-40"
                    style={{ ...common, height: "100%" }}
                  />
                ) : (
                  <input
                    value={page.texts[t.id] ?? ""}
                    onChange={(e) => onTextChange?.(t.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
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
          </div>
        );
      })}
    </div>
  );
}
