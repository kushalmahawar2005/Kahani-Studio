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
  type MagPage,
  type Photo,
  type TextBlock,
  type TextStyle,
  type Theme,
} from "@/lib/magazine/templates";

const W = PAGE.w;
const H = PAGE.h;
const FRAME = 5; // white mat thickness, pt

const PDF_FONT: Record<TextStyle, string> = {
  display: "Times-Bold",
  "serif-italic": "Times-Italic",
  label: "Helvetica-Bold",
  sans: "Helvetica",
};

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
            {/* Photos */}
            {tpl.slots.map((s, i) => {
              const photo = page.photoIds[i] ? photos[page.photoIds[i] as string] : undefined;
              if (!photo) return null;
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
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image */}
                  <Image
                    src={photo.dataUrl}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
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

            {/* Text blocks */}
            {tpl.texts.map((t) => {
              const value = page.texts[t.id] ?? "";
              if (value.trim() === "") return null;
              const text = t.upper ? value.toUpperCase() : value;
              const textStyle = {
                fontFamily: PDF_FONT[t.style],
                fontSize: t.size,
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
                    left: t.x * W,
                    top: t.y * H,
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
