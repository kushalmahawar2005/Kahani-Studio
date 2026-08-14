"use client";

import {
  Document,
  Page,
  View,
  Image,
  Text,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  pdf,
} from "@react-pdf/renderer";
import {
  PAGE,
  THEMES,
  getTemplate,
  coverRatios,
  styleToFontChoice,
  DEFAULT_FOCUS,
  type MagPage,
  type Photo,
  type TextBlock,
  type FontFamily,
  type FontWeight,
  type Theme,
} from "@/lib/magazine/templates";

const W = PAGE.w;
const H = PAGE.h;
const FRAME = 5; // white mat thickness, pt

/** react-pdf only ships the 14 standard PDF fonts — Times (serif-ish) and
 * Helvetica (sans-ish) are the closest built-in match to any of the 5
 * on-screen font choices, since embedding the actual Google Fonts as PDF
 * fonts isn't worth the extra fetch/registration for a print export. */
function pdfFontFor(family: FontFamily, weight: FontWeight): string {
  const base = family === "sans" || family === "modern" ? "Helvetica" : "Times";
  if (weight === "bold") return base === "Helvetica" ? "Helvetica-Bold" : "Times-Bold";
  if (weight === "italic") return base === "Helvetica" ? "Helvetica-Oblique" : "Times-Italic";
  return base === "Helvetica" ? "Helvetica" : "Times-Roman";
}

function color(c: TextBlock["color"], theme: Theme): string {
  switch (c) {
    case "text": return theme.text;
    case "sub": return theme.sub;
    case "accent": return theme.accent;
    case "onPhoto": return "#F9F9EA";
    case "onAccent": return theme.onAccent;
  }
}

/**
 * Build the print PDF from the same template specs used on screen.
 * Photos embed at native resolution, so a large upload prints crisp
 * (an A4-wide slot needs ~2480px for 300 DPI).
 */
function MagazineDocument({
  pages,
  photos,
}: {
  pages: MagPage[];
  photos: Record<string, Photo>;
}) {
  return (
    <Document title="Kahani Clicks — Magazine">
      {pages.map((page) => {
        const tpl = getTemplate(page.templateId);
        const theme = THEMES[tpl.theme];
        const g = tpl.gap;

        return (
          <Page key={page.id} size={[W, H]} style={{ backgroundColor: theme.bg }}>
            {/* Photos — cropped per the same pan/zoom focus used on screen */}
            {tpl.slots.map((s, i) => {
              const photo = page.photoIds[i] ? photos[page.photoIds[i] as string] : undefined;
              if (!photo) return null;

              const contentW = s.w * W - g - (s.frame ? 2 * FRAME : 0);
              const contentH = s.h * H - g - (s.frame ? 2 * FRAME : 0);
              // Use the actual content-box ratio (post gap/frame), not the
              // outer slot ratio — they diverge and crops must match the
              // on-screen canvas exactly.
              const slotAR = contentW / contentH;
              const imgAR = photo.width / photo.height;
              const focus = page.focus[i] ?? DEFAULT_FOCUS;
              const { ratioW, ratioH } = coverRatios(imgAR, slotAR, focus.zoom);
              const imgW = contentW * ratioW;
              const imgH = contentH * ratioH;
              const imgLeft = contentW * 0.5 - focus.x * imgW;
              const imgTop = contentH * 0.5 - focus.y * imgH;

              return (
                <View
                  key={i}
                  style={{
                    position: "absolute",
                    left: s.x * W + g / 2,
                    top: s.y * H + g / 2,
                    width: s.w * W - g,
                    height: s.h * H - g,
                    backgroundColor: s.frame ? theme.frame : undefined,
                    padding: s.frame ? FRAME : 0,
                  }}
                >
                  <View style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
                    <Image
                      src={photo.dataUrl}
                      style={{ position: "absolute", left: imgLeft, top: imgTop, width: imgW, height: imgH }}
                    />
                  </View>
                </View>
              );
            })}

            {/* Bottom scrim (real gradient via SVG) */}
            {tpl.scrim && (
              <Svg
                style={{ position: "absolute", left: 0, bottom: 0, width: W, height: H * 0.42 }}
                viewBox={`0 0 ${W} ${H * 0.42}`}
              >
                <Defs>
                  <LinearGradient id="scrim" x1="0" y1="1" x2="0" y2="0">
                    <Stop offset="0" stopColor="#000000" stopOpacity={0.62} />
                    <Stop offset="1" stopColor="#000000" stopOpacity={0} />
                  </LinearGradient>
                </Defs>
                <Rect x={0} y={0} width={W} height={H * 0.42} fill="url(#scrim)" />
              </Svg>
            )}

            {/* Fixed branding logos */}
            {tpl.logos?.map((l, i) => {
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const src = l.src.startsWith("http") ? l.src : `${origin}${l.src}`;
              return (
                <View
                  key={`logo${i}`}
                  style={{ position: "absolute", left: l.x * W, top: l.y * H, width: l.w * W, height: l.h * H }}
                >
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
                  <Image src={src} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </View>
              );
            })}

            {/* Decorative rules */}
            {tpl.rules?.map((r, i) => (
              <View
                key={`r${i}`}
                style={{
                  position: "absolute",
                  left: r.x * W,
                  top: r.y * H,
                  width: r.w * W,
                  height: 0.8,
                  backgroundColor: theme.accent,
                  opacity: 0.7,
                }}
              />
            ))}

            {/* Template text blocks */}
            {tpl.texts.map((t) => {
              if (page.hiddenTexts.includes(t.id)) return null;
              const value = page.texts[t.id] ?? "";
              if (value.trim() === "") return null;
              const text = t.upper ? value.toUpperCase() : value;
              const pos = page.textPos[t.id] ?? { x: t.x, y: t.y };
              const choice = page.textFont[t.id] ?? styleToFontChoice(t.style);
              const fontSize = page.textSize[t.id] ?? t.size;
              const textStyle = {
                fontFamily: pdfFontFor(choice.family, choice.weight),
                fontSize,
                color: color(t.color, theme),
                textAlign: t.align,
                letterSpacing: t.tracking ?? 0,
                lineHeight: 1.25,
              };
              return (
                <View
                  key={t.id}
                  style={{
                    position: "absolute",
                    left: pos.x * W,
                    top: pos.y * H,
                    width: t.w * W,
                    height: t.h * H,
                    justifyContent: "flex-start",
                    alignItems:
                      t.align === "center" ? "center" : t.align === "right" ? "flex-end" : "flex-start",
                  }}
                >
                  {t.box ? (
                    <View style={{ backgroundColor: theme.accent, paddingVertical: 5, paddingHorizontal: 10 }}>
                      <Text style={textStyle}>{text}</Text>
                    </View>
                  ) : (
                    <Text style={{ ...textStyle, width: "100%" }}>{text}</Text>
                  )}
                </View>
              );
            })}

            {/* User-added free text boxes */}
            {page.customTexts.map((c) => {
              if (c.text.trim() === "") return null;
              const textStyle = {
                fontFamily: pdfFontFor(c.family, c.weight),
                fontSize: c.size,
                color: color(c.color, theme),
                textAlign: c.align,
                lineHeight: 1.25,
              };
              return (
                <View
                  key={c.id}
                  style={{
                    position: "absolute",
                    left: c.x * W,
                    top: c.y * H,
                    width: c.w * W,
                    height: c.h * H,
                    justifyContent: "flex-start",
                    alignItems:
                      c.align === "center" ? "center" : c.align === "right" ? "flex-end" : "flex-start",
                  }}
                >
                  <Text style={{ ...textStyle, width: "100%" }}>{c.text}</Text>
                </View>
              );
            })}
          </Page>
        );
      })}
    </Document>
  );
}

/** Render the magazine to a PDF Blob and trigger a browser download. */
export async function downloadMagazinePdf(
  pages: MagPage[],
  photos: Record<string, Photo>,
  filename = "kahani-magazine.pdf"
) {
  const blob = await pdf(<MagazineDocument pages={pages} photos={photos} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
