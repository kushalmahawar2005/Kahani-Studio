// Magazine builder — premium template engine.
// One spec drives BOTH the on-screen HTML preview and the print PDF,
// so layouts, type and themes never drift between the two.

/** A4 portrait, in PDF points (1pt = 1/72 inch). Big enough for 300 DPI print. */
export const PAGE = { w: 595.28, h: 841.89 };

/* ─────────────────────────  Themes  ───────────────────────── */

export type ThemeId = "cream" | "ivory" | "olive" | "gray";

export interface Theme {
  bg: string;
  text: string;
  sub: string;
  accent: string;
  /** Photo frame colour (the white/ivory mat around a photo). */
  frame: string;
  /** Text colour to sit on top of accent label boxes. */
  onAccent: string;
}

export const THEMES: Record<ThemeId, Theme> = {
  cream: { bg: "#F3EEE3", text: "#2B2723", sub: "#8A8175", accent: "#A45A3A", frame: "#FFFFFF", onAccent: "#FBF7EF" },
  ivory: { bg: "#F7F3EA", text: "#3A342C", sub: "#9A8D7A", accent: "#8C6A4A", frame: "#FFFFFF", onAccent: "#FBF7EF" },
  olive: { bg: "#3B3D24", text: "#E9E4CF", sub: "#B9B393", accent: "#C9A24B", frame: "#E9E4CF", onAccent: "#3B3D24" },
  gray: { bg: "#D9D6CF", text: "#2B2723", sub: "#7D756A", accent: "#9C8F7D", frame: "#FFFFFF", onAccent: "#FFFFFF" },
};

/* ─────────────────────────  Spec types  ───────────────────────── */

/** A photo slot, in normalized page coordinates (0..1). */
export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Draw a white mat + light border around the photo. */
  frame?: boolean;
}

export type TextStyle = "display" | "serif-italic" | "label" | "sans";
export type TextColor = "text" | "sub" | "accent" | "onPhoto" | "onAccent";

export interface TextBlock {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  align: "left" | "center" | "right";
  /** Font size in PDF points (scales identically in preview). */
  size: number;
  style: TextStyle;
  color: TextColor;
  /** Placeholder shown in the editor when empty. */
  placeholder: string;
  /** Pre-filled text so a page looks complete before editing. */
  default: string;
  multiline?: boolean;
  upper?: boolean;
  tracking?: number;
  /** Render a filled accent box behind the text (a label chip). */
  box?: boolean;
}

/** A thin decorative rule (horizontal line). */
export interface Rule {
  x: number;
  y: number;
  w: number;
}

/** A fixed branding image (e.g. the studio wordmark) baked into the template. */
export interface LogoSpec {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Template {
  id: string;
  name: string;
  theme: ThemeId;
  gap: number;
  slots: Slot[];
  texts: TextBlock[];
  rules?: Rule[];
  /** Fixed branding images (logo / monogram), drawn above photos. */
  logos?: LogoSpec[];
  /** Dark gradient at the bottom — for titles laid over full-bleed photos. */
  scrim?: boolean;
  /** width/height ratio of the page. Defaults to PAGE's A4 ratio (magazine
   * templates); Instagram templates set this to 1 (square) or 0.8 (4:5). */
  aspect?: number;
  kind?: "magazine" | "instagram";
}

/* ─────────────────────────  Shared defaults  ───────────────────────── */

const NAMES = "Kaushal  &  Poonam";
const CREDIT = "@kahani_click";
const Q1 = "Life is so hard, but being with you makes it easier.";
const Q2 = "A bride is not defined by her jewelry, but by the strength in her smile and the calm in her soul.";
const Q3 = "Marriage is more than a union of two hearts — it is a partnership built on trust, patience and love.";

/* ─────────────────────────  Templates  ───────────────────────── */

export const TEMPLATES: Template[] = [
  /* 1 — Editorial cover: side strip + hero + quote (cream) */
  {
    id: "cover-withyou",
    name: "With You · Cover",
    theme: "cream",
    gap: 8,
    slots: [
      { x: 0.0, y: 0.0, w: 0.33, h: 0.335, frame: true },
      { x: 0.0, y: 0.335, w: 0.33, h: 0.33, frame: true },
      { x: 0.0, y: 0.665, w: 0.33, h: 0.335, frame: true },
      { x: 0.39, y: 0.2, w: 0.61, h: 0.58, frame: true },
    ],
    texts: [
      { id: "title", x: 0.37, y: 0.02, w: 0.63, h: 0.12, align: "center", size: 52, style: "display", color: "text", placeholder: "Title", default: "With You" },
      { id: "names", x: 0.37, y: 0.145, w: 0.63, h: 0.04, align: "center", size: 12, style: "label", color: "sub", upper: true, tracking: 3, placeholder: "Names", default: NAMES },
      { id: "caption", x: 0.39, y: 0.8, w: 0.61, h: 0.13, align: "center", size: 15, style: "serif-italic", color: "text", multiline: true, placeholder: "A short line…", default: Q1 },
      { id: "credit", x: 0.0, y: 0.95, w: 1.0, h: 0.04, align: "center", size: 9, style: "label", color: "sub", upper: true, tracking: 4, placeholder: "Studio", default: CREDIT },
    ],
  },

  /* 2 — Dark 2×2 grid with gold rules (olive) */
  {
    id: "tulsi-grid4",
    name: "Tulsi · Dark grid",
    theme: "olive",
    gap: 8,
    slots: [
      { x: 0.18, y: 0.22, w: 0.32, h: 0.26, frame: true },
      { x: 0.5, y: 0.22, w: 0.32, h: 0.26, frame: true },
      { x: 0.18, y: 0.48, w: 0.32, h: 0.26, frame: true },
      { x: 0.5, y: 0.48, w: 0.32, h: 0.26, frame: true },
    ],
    rules: [
      { x: 0.18, y: 0.18, w: 0.64 },
      { x: 0.18, y: 0.78, w: 0.64 },
    ],
    texts: [
      { id: "title", x: 0.1, y: 0.07, w: 0.8, h: 0.07, align: "center", size: 26, style: "label", color: "accent", upper: true, tracking: 10, placeholder: "Title", default: "Tulsi" },
      { id: "caption", x: 0.12, y: 0.82, w: 0.76, h: 0.1, align: "center", size: 11, style: "serif-italic", color: "sub", multiline: true, placeholder: "A short line…", default: Q2 },
      { id: "credit", x: 0.0, y: 0.95, w: 1.0, h: 0.04, align: "center", size: 8, style: "label", color: "sub", upper: true, tracking: 4, placeholder: "Studio", default: CREDIT },
    ],
  },

  /* 3 — Six-up story with caption (gray) */
  {
    id: "story-sa",
    name: "Story · Six-up",
    theme: "gray",
    gap: 8,
    slots: [
      { x: 0.04, y: 0.03, w: 0.44, h: 0.18 },
      { x: 0.52, y: 0.03, w: 0.44, h: 0.18 },
      { x: 0.04, y: 0.22, w: 0.44, h: 0.18 },
      { x: 0.52, y: 0.22, w: 0.44, h: 0.18 },
      { x: 0.04, y: 0.41, w: 0.44, h: 0.18 },
      { x: 0.52, y: 0.41, w: 0.44, h: 0.18 },
    ],
    texts: [
      { id: "title", x: 0.2, y: 0.63, w: 0.6, h: 0.1, align: "center", size: 42, style: "display", color: "text", tracking: 6, placeholder: "Title", default: "S / A" },
      { id: "caption", x: 0.12, y: 0.76, w: 0.76, h: 0.2, align: "center", size: 10, style: "serif-italic", color: "sub", multiline: true, placeholder: "Describe the moment…", default: Q3 },
    ],
  },

  /* 4 — Asymmetric ceremony with label + paragraph (ivory) */
  {
    id: "sindoor",
    name: "Ceremony · Asymmetric",
    theme: "ivory",
    gap: 8,
    slots: [
      { x: 0.04, y: 0.3, w: 0.44, h: 0.5, frame: true },
      { x: 0.52, y: 0.04, w: 0.44, h: 0.42, frame: true },
      { x: 0.52, y: 0.5, w: 0.44, h: 0.46, frame: true },
    ],
    texts: [
      { id: "title", x: 0.04, y: 0.05, w: 0.44, h: 0.12, align: "left", size: 44, style: "serif-italic", color: "accent", placeholder: "Title", default: "Sindoor" },
      { id: "label", x: 0.04, y: 0.2, w: 0.4, h: 0.05, align: "center", size: 11, style: "label", color: "onAccent", upper: true, tracking: 3, box: true, placeholder: "Label", default: "Sindoor Ceremony" },
      { id: "caption", x: 0.04, y: 0.84, w: 0.44, h: 0.14, align: "left", size: 9.5, style: "sans", color: "sub", multiline: true, placeholder: "Add a description…", default: "A staple of the Hindu marriage ceremony — believed to protect the bride and bless the union with long life and fortune." },
    ],
  },

  /* 5 — Full-bleed triptych with overlaid title (cream scrim) */
  {
    id: "bride-triptych",
    name: "Bride · Triptych",
    theme: "cream",
    gap: 6,
    scrim: true,
    slots: [
      { x: 0.0, y: 0.0, w: 0.34, h: 1.0 },
      { x: 0.34, y: 0.0, w: 0.32, h: 1.0 },
      { x: 0.66, y: 0.0, w: 0.34, h: 1.0 },
    ],
    texts: [
      { id: "kicker", x: 0.04, y: 0.66, w: 0.6, h: 0.04, align: "left", size: 12, style: "label", color: "onPhoto", upper: true, tracking: 4, placeholder: "Kicker", default: "Queen of the Day" },
      { id: "title", x: 0.03, y: 0.69, w: 0.7, h: 0.16, align: "left", size: 60, style: "display", color: "onPhoto", placeholder: "Title", default: "Bride" },
      { id: "caption", x: 0.04, y: 0.87, w: 0.62, h: 0.1, align: "left", size: 10, style: "serif-italic", color: "onPhoto", multiline: true, placeholder: "A short line…", default: Q2 },
    ],
  },

  /* 6 — Letterbox stack with centred title (cream) */
  {
    id: "letterbox3",
    name: "Letterbox · Three",
    theme: "cream",
    gap: 8,
    slots: [
      { x: 0.12, y: 0.05, w: 0.76, h: 0.18, frame: true },
      { x: 0.05, y: 0.26, w: 0.9, h: 0.24, frame: true },
      { x: 0.18, y: 0.53, w: 0.64, h: 0.17, frame: true },
    ],
    texts: [
      { id: "title", x: 0.25, y: 0.73, w: 0.5, h: 0.09, align: "center", size: 36, style: "display", color: "text", placeholder: "Title", default: "Saath" },
      { id: "caption", x: 0.1, y: 0.83, w: 0.8, h: 0.12, align: "center", size: 12, style: "serif-italic", color: "sub", multiline: true, placeholder: "A short line…", default: Q3 },
      { id: "credit", x: 0.0, y: 0.95, w: 1.0, h: 0.04, align: "center", size: 8, style: "label", color: "sub", upper: true, tracking: 4, placeholder: "Studio", default: CREDIT },
    ],
  },

  /* 7 — Mood-board collage with names (cream) */
  {
    id: "collage-mood",
    name: "Mood-board · Collage",
    theme: "cream",
    gap: 8,
    slots: [
      { x: 0.04, y: 0.06, w: 0.42, h: 0.26, frame: true },
      { x: 0.04, y: 0.34, w: 0.42, h: 0.34, frame: true },
      { x: 0.04, y: 0.7, w: 0.42, h: 0.24, frame: true },
      { x: 0.52, y: 0.06, w: 0.44, h: 0.3, frame: true },
      { x: 0.52, y: 0.5, w: 0.44, h: 0.44, frame: true },
    ],
    texts: [
      { id: "names", x: 0.52, y: 0.38, w: 0.44, h: 0.05, align: "left", size: 13, style: "label", color: "text", upper: true, tracking: 4, placeholder: "Names", default: "Shreya & Harshil" },
      { id: "title", x: 0.52, y: 0.43, w: 0.44, h: 0.06, align: "left", size: 18, style: "serif-italic", color: "accent", placeholder: "Event", default: "Haldi" },
    ],
    rules: [{ x: 0.52, y: 0.435, w: 0.44 }],
  },

  /* 8 — Word + photo editorial rows (ivory) */
  {
    id: "words-strip",
    name: "Words · Editorial",
    theme: "ivory",
    gap: 8,
    slots: [
      { x: 0.4, y: 0.03, w: 0.57, h: 0.22 },
      { x: 0.03, y: 0.27, w: 0.57, h: 0.22 },
      { x: 0.4, y: 0.51, w: 0.57, h: 0.22 },
      { x: 0.03, y: 0.75, w: 0.57, h: 0.22 },
    ],
    texts: [
      { id: "w1", x: 0.04, y: 0.08, w: 0.34, h: 0.12, align: "left", size: 30, style: "display", color: "text", placeholder: "Word", default: "Magical" },
      { id: "w2", x: 0.62, y: 0.32, w: 0.35, h: 0.12, align: "right", size: 30, style: "display", color: "text", placeholder: "Word", default: "Moments" },
      { id: "w3", x: 0.04, y: 0.56, w: 0.34, h: 0.12, align: "left", size: 30, style: "display", color: "text", placeholder: "Word", default: "Forever" },
      { id: "w4", x: 0.62, y: 0.8, w: 0.35, h: 0.12, align: "right", size: 30, style: "display", color: "text", placeholder: "Word", default: "Love" },
    ],
  },

  /* 9 — Hero with inset frame + names (cream) */
  {
    id: "hero-inset",
    name: "Hero · Inset frame",
    theme: "cream",
    gap: 0,
    slots: [
      { x: 0.0, y: 0.3, w: 1.0, h: 0.7 },
      { x: 0.26, y: 0.12, w: 0.48, h: 0.42, frame: true },
    ],
    texts: [
      { id: "kicker", x: 0.26, y: 0.02, w: 0.48, h: 0.05, align: "center", size: 22, style: "display", color: "accent", placeholder: "Name", default: "Chiron" },
      { id: "title", x: 0.26, y: 0.06, w: 0.48, h: 0.06, align: "center", size: 24, style: "serif-italic", color: "text", placeholder: "Name", default: "Prakruti" },
    ],
  },

  /* 10 — Feature + two with caption (gray) */
  {
    id: "feature-editorial",
    name: "Feature + Two",
    theme: "gray",
    gap: 8,
    slots: [
      { x: 0.04, y: 0.06, w: 0.52, h: 0.7, frame: true },
      { x: 0.6, y: 0.06, w: 0.36, h: 0.34, frame: true },
      { x: 0.6, y: 0.42, w: 0.36, h: 0.34, frame: true },
    ],
    texts: [
      { id: "title", x: 0.04, y: 0.79, w: 0.5, h: 0.08, align: "left", size: 34, style: "display", color: "text", placeholder: "Title", default: "The Story" },
      { id: "caption", x: 0.04, y: 0.88, w: 0.92, h: 0.1, align: "left", size: 10, style: "serif-italic", color: "sub", multiline: true, placeholder: "A short line…", default: Q1 },
    ],
  },

  /* 11 — Cinematic panorama bands (olive dark) */
  {
    id: "panorama-band",
    name: "Cinematic · Panorama",
    theme: "olive",
    gap: 10,
    slots: [
      { x: 0.1, y: 0.08, w: 0.8, h: 0.16 },
      { x: 0.04, y: 0.28, w: 0.92, h: 0.22 },
      { x: 0.1, y: 0.54, w: 0.8, h: 0.16 },
    ],
    texts: [
      { id: "title", x: 0.2, y: 0.74, w: 0.6, h: 0.07, align: "center", size: 22, style: "label", color: "accent", upper: true, tracking: 10, placeholder: "Title", default: "Cinematic" },
      { id: "caption", x: 0.12, y: 0.83, w: 0.76, h: 0.1, align: "center", size: 11, style: "serif-italic", color: "sub", multiline: true, placeholder: "A short line…", default: Q3 },
    ],
  },

  /* 12 — Branding / back cover (olive) */
  {
    id: "logo-back",
    name: "Branding · Cover",
    theme: "olive",
    gap: 0,
    slots: [],
    logos: [{ src: "/branding_clean.png", x: 0.18, y: 0.34, w: 0.64, h: 0.14 }],
    rules: [
      { x: 0.3, y: 0.3, w: 0.4 },
      { x: 0.3, y: 0.54, w: 0.4 },
    ],
    texts: [
      { id: "tagline", x: 0.15, y: 0.57, w: 0.7, h: 0.05, align: "center", size: 11, style: "label", color: "sub", upper: true, tracking: 5, placeholder: "Tagline", default: "Capturing timeless stories" },
      { id: "est", x: 0.15, y: 0.86, w: 0.7, h: 0.04, align: "center", size: 9, style: "label", color: "accent", upper: true, tracking: 4, placeholder: "Established", default: "Est. MMXXIV · Rajasthan" },
      { id: "contact", x: 0.15, y: 0.9, w: 0.7, h: 0.04, align: "center", size: 9, style: "label", color: "sub", upper: true, tracking: 3, placeholder: "Contact", default: "@kahani_click · wa.me / 919610240176" },
    ],
  },
];

/* ─────────────────────────  Instagram post templates  ───────────────────────── */
/* Same Slot/TextBlock engine as the magazine, framed for square (1:1) or
   portrait (4:5) posts instead of an A4 page. */

export const IG_TEMPLATES: Template[] = [
  /* Full-bleed photo + quote, scrim at bottom (square) */
  {
    id: "ig-photo-quote",
    name: "Quote · Full Photo",
    theme: "cream",
    kind: "instagram",
    aspect: 1,
    gap: 0,
    scrim: true,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    texts: [
      { id: "quote", x: 0.08, y: 0.66, w: 0.84, h: 0.24, align: "center", size: 26, style: "serif-italic", color: "onPhoto", multiline: true, placeholder: "A short line…", default: Q1 },
      { id: "credit", x: 0, y: 0.93, w: 1, h: 0.05, align: "center", size: 11, style: "label", color: "onPhoto", upper: true, tracking: 4, placeholder: "Studio", default: CREDIT },
    ],
  },

  /* Framed portrait photo, title + caption below (4:5) */
  {
    id: "ig-portrait-caption",
    name: "Caption · Portrait",
    theme: "cream",
    kind: "instagram",
    aspect: 0.8,
    gap: 8,
    slots: [{ x: 0.06, y: 0.06, w: 0.88, h: 0.6, frame: true }],
    texts: [
      { id: "title", x: 0.1, y: 0.7, w: 0.8, h: 0.09, align: "center", size: 34, style: "display", color: "text", placeholder: "Title", default: "With You" },
      { id: "caption", x: 0.12, y: 0.8, w: 0.76, h: 0.12, align: "center", size: 14, style: "serif-italic", color: "sub", multiline: true, placeholder: "A short line…", default: Q3 },
      { id: "credit", x: 0, y: 0.94, w: 1, h: 0.04, align: "center", size: 9, style: "label", color: "sub", upper: true, tracking: 4, placeholder: "Studio", default: CREDIT },
    ],
  },

  /* Testimonial: big quote + small avatar + name (square) */
  {
    id: "ig-testimonial",
    name: "Testimonial",
    theme: "ivory",
    kind: "instagram",
    aspect: 1,
    gap: 8,
    slots: [{ x: 0.1, y: 0.62, w: 0.2, h: 0.2, frame: true }],
    texts: [
      { id: "quote", x: 0.1, y: 0.1, w: 0.8, h: 0.42, align: "left", size: 28, style: "serif-italic", color: "text", multiline: true, placeholder: "The testimonial…", default: Q2 },
      { id: "names", x: 0.36, y: 0.68, w: 0.54, h: 0.06, align: "left", size: 15, style: "label", color: "accent", upper: true, tracking: 2, placeholder: "Names", default: NAMES },
      { id: "location", x: 0.36, y: 0.74, w: 0.54, h: 0.05, align: "left", size: 10, style: "sans", color: "sub", upper: true, tracking: 3, placeholder: "Location", default: "Udaipur, 2026" },
      { id: "credit", x: 0, y: 0.93, w: 1, h: 0.05, align: "center", size: 9, style: "label", color: "sub", upper: true, tracking: 4, placeholder: "Studio", default: CREDIT },
    ],
  },

  /* Typographic promo — no photo needed (square) */
  {
    id: "ig-promo",
    name: "Promo · Typographic",
    theme: "olive",
    kind: "instagram",
    aspect: 1,
    gap: 0,
    slots: [],
    logos: [{ src: "/branding_clean.png", x: 0.3, y: 0.1, w: 0.4, h: 0.1 }],
    rules: [
      { x: 0.25, y: 0.42, w: 0.5 },
      { x: 0.25, y: 0.66, w: 0.5 },
    ],
    texts: [
      { id: "kicker", x: 0.1, y: 0.24, w: 0.8, h: 0.06, align: "center", size: 13, style: "label", color: "accent", upper: true, tracking: 6, placeholder: "Kicker", default: "Now Booking" },
      { id: "title", x: 0.1, y: 0.46, w: 0.8, h: 0.16, align: "center", size: 46, style: "display", color: "text", placeholder: "Title", default: "2026 Dates" },
      { id: "caption", x: 0.15, y: 0.7, w: 0.7, h: 0.1, align: "center", size: 12, style: "sans", color: "sub", multiline: true, placeholder: "Details…", default: "Only 4 dates left — write to us for a bespoke wedding film." },
      { id: "contact", x: 0.15, y: 0.88, w: 0.7, h: 0.04, align: "center", size: 9, style: "label", color: "sub", upper: true, tracking: 3, placeholder: "Contact", default: "@kahani_click · wa.me / 919610240176" },
    ],
  },

  /* Side-by-side duo, shared caption (square) */
  {
    id: "ig-duo",
    name: "Duo · Side by Side",
    theme: "gray",
    kind: "instagram",
    aspect: 1,
    gap: 8,
    slots: [
      { x: 0.04, y: 0.06, w: 0.44, h: 0.72, frame: true },
      { x: 0.52, y: 0.06, w: 0.44, h: 0.72, frame: true },
    ],
    texts: [
      { id: "title", x: 0.1, y: 0.82, w: 0.8, h: 0.08, align: "center", size: 24, style: "display", color: "text", placeholder: "Title", default: "Before & After" },
      { id: "credit", x: 0, y: 0.93, w: 1, h: 0.05, align: "center", size: 9, style: "label", color: "sub", upper: true, tracking: 4, placeholder: "Studio", default: CREDIT },
    ],
  },

  /* Hero portrait, name overlay bottom (4:5) */
  {
    id: "ig-hero-portrait",
    name: "Hero · Portrait",
    theme: "cream",
    kind: "instagram",
    aspect: 0.8,
    gap: 0,
    scrim: true,
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
    texts: [
      { id: "kicker", x: 0.08, y: 0.78, w: 0.84, h: 0.05, align: "left", size: 12, style: "label", color: "onPhoto", upper: true, tracking: 4, placeholder: "Kicker", default: "Queen of the Day" },
      { id: "title", x: 0.07, y: 0.82, w: 0.86, h: 0.12, align: "left", size: 44, style: "display", color: "onPhoto", placeholder: "Title", default: "Bride" },
      { id: "credit", x: 0.08, y: 0.94, w: 0.84, h: 0.04, align: "left", size: 9, style: "label", color: "onPhoto", upper: true, tracking: 3, placeholder: "Studio", default: CREDIT },
    ],
  },
];

export const getTemplate = (id: string): Template =>
  [...TEMPLATES, ...IG_TEMPLATES].find((t) => t.id === id) ?? TEMPLATES[0];

/* ─────────────────────────  Page state  ───────────────────────── */

export interface MagPage {
  id: string;
  templateId: string;
  /** One entry per slot; photo id or null. */
  photoIds: (string | null)[];
  /** Pan/zoom crop per slot index. Slots without an entry use DEFAULT_FOCUS. */
  focus: Record<number, Focus>;
  /** Editable text, keyed by TextBlock id. */
  texts: Record<string, string>;
  /** Dragged position override for a template's TextBlocks, keyed by TextBlock id. */
  textPos: Record<string, { x: number; y: number }>;
  /** User-added free text boxes, on top of the template's own. */
  customTexts: CustomTextBox[];
  /** Template TextBlock ids the user has fully deleted from this page. */
  hiddenTexts: string[];
}

/** A user-added text box — same styling vocabulary as a template TextBlock,
 * but freely positioned, resized and deleted by the person editing. */
export interface CustomTextBox {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  text: string;
  align: "left" | "center" | "right";
  size: number;
  style: TextStyle;
  color: TextColor;
}

export function makeCustomTextBox(): CustomTextBox {
  return {
    id: `tx_${Math.random().toString(36).slice(2, 9)}`,
    x: 0.25,
    y: 0.45,
    w: 0.5,
    h: 0.1,
    text: "Double-click to edit",
    align: "center",
    size: 20,
    style: "sans",
    color: "text",
  };
}

export interface Photo {
  id: string;
  /** base64 JPEG data URL, normalized at upload time — works in both
   * <img> and react-pdf <Image> (which only supports PNG/JPEG). */
  dataUrl: string;
  name: string;
  /** Natural pixel dimensions of the normalized image — used for crop math. */
  width: number;
  height: number;
}

/** Pan/zoom crop for a photo inside a slot. x/y are the fraction of the
 * source image centered in the slot; zoom 1 = default cover-fit. */
export interface Focus {
  x: number;
  y: number;
  zoom: number;
}

export const DEFAULT_FOCUS: Focus = { x: 0.5, y: 0.5, zoom: 1 };

/** scale factors (relative to the slot box) an image needs at a given
 * zoom to cover a slot of aspect ratio slotAR, for an image of aspect
 * ratio imgAR. Shared by the on-screen canvas and the PDF renderer so
 * crops match exactly between the two. */
export function coverRatios(imgAR: number, slotAR: number, zoom: number) {
  const ratioW = (imgAR >= slotAR ? imgAR / slotAR : 1) * zoom;
  const ratioH = (imgAR >= slotAR ? 1 : slotAR / imgAR) * zoom;
  return { ratioW, ratioH };
}

/** Build a page for a template, preserving any photos/text that still fit. */
export function makePage(templateId: string, previous?: MagPage): MagPage {
  const tpl = getTemplate(templateId);
  const prevPhotos = previous?.photoIds ?? [];
  const texts: Record<string, string> = {};
  for (const t of tpl.texts) {
    texts[t.id] = previous?.texts?.[t.id] ?? t.default;
  }
  return {
    id: previous?.id ?? `pg_${Math.random().toString(36).slice(2, 9)}`,
    templateId,
    photoIds: tpl.slots.map((_, i) => prevPhotos[i] ?? null),
    focus: previous?.focus ?? {},
    texts,
    textPos: previous?.textPos ?? {},
    customTexts: previous?.customTexts ?? [],
    hiddenTexts: previous?.hiddenTexts ?? [],
  };
}

/* Font stacks for the on-screen preview (PDF uses built-in fonts). */
export const PREVIEW_FONT: Record<TextStyle, string> = {
  display: "var(--font-playfair), Georgia, serif",
  "serif-italic": "var(--font-playfair), Georgia, serif",
  label: "var(--font-inter), system-ui, sans-serif",
  sans: "var(--font-inter), system-ui, sans-serif",
};
