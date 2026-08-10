/**
 * Maps every image/video slot on the public site to the homepage section it
 * appears in, so the admin sidebar can scope the media grid per-section
 * instead of dumping every asset into one flat list. A key can legitimately
 * appear in more than one section (the same photo is reused in a few
 * places) — that's expected, not a bug.
 */
export type AdminSection = {
  id: string;
  label: string;
  group: "Branding" | "Homepage";
  keys: string[];
};

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "branding",
    label: "Logo & Marks",
    group: "Branding",
    keys: ["branding_clean.png", "chakra.png", "shankha.png"],
  },
  {
    id: "hero",
    label: "Hero Stack",
    group: "Homepage",
    keys: ["1000407545.jpg", "CA9A1703.JPG", "1000407549.jpg", "CA9A3856.JPG"],
  },
  {
    id: "philosophy-strip",
    label: "Philosophy Strip",
    group: "Homepage",
    keys: [
      "1000407549.jpg",
      "1000928376.jpg",
      "CA9A1703.JPG",
      "1000851638.jpg",
      "CA9A3856.JPG",
      "1000407545.jpg",
    ],
  },
  {
    id: "work-gallery",
    label: "The Works (Gallery)",
    group: "Homepage",
    keys: [
      "1000407545.jpg",
      "1000407549.jpg",
      "1000519122.jpg",
      "1000519168.jpg",
      "1000851634.jpg",
      "1000851638.jpg",
      "1000851652.jpg",
      "1000927051.jpg",
      "1000928359.jpg",
      "1000928374.jpg",
      "1000928376.jpg",
      "CA9A1701.JPG",
      "CA9A0451.JPG",
      "CA9A1518.JPG",
      "CA9A1588.JPG",
      "CA9A1703.JPG",
      "CA9A2039.JPG",
      "CA9A2048.JPG",
      "CA9A2577.JPG",
      "CA9A2580.JPG",
      "CA9A3213.JPG",
      "CA9A9580.JPG",
      "CA9A9689.JPG",
      "CA9A9700.jpg",
      "CA9A9996.JPG",
      "_MVS2232.JPG",
      "b28f26484d0520cb6be6381f8ddd091c.jpg",
      "CA9A3856.JPG",
      "1000928369.jpg",
    ],
  },
  {
    id: "editorial-split",
    label: "Editorial Split",
    group: "Homepage",
    keys: ["1000928369.jpg", "1000851634.jpg", "1000928359.jpg", "1000407545.jpg"],
  },
  {
    id: "showreel",
    label: "Showreel",
    group: "Homepage",
    keys: ["r1.mov"],
  },
  {
    id: "reels",
    label: "The Reels",
    group: "Homepage",
    keys: [
      "s1.mp4",
      "1000407545.jpg",
      "r2.mp4",
      "CA9A1703.JPG",
      "s2.mp4",
      "1000928369.jpg",
      "CA9A3856.JPG",
      "r1.mp4",
      "1000407549.jpg",
    ],
  },
  {
    id: "legacy-banners",
    label: "Full-Bleed Banners",
    group: "Homepage",
    keys: ["r2.mp4", "CA9A3213.JPG", "1000928374.jpg"],
  },
  {
    id: "about-section",
    label: "Philosophy / Founder",
    group: "Homepage",
    keys: ["1000928369.jpg"],
  },
  {
    id: "services",
    label: "Services",
    group: "Homepage",
    keys: ["1000407545.jpg", "1000519122.jpg", "1000519168.jpg"],
  },
  {
    id: "testimonials",
    label: "Testimonials",
    group: "Homepage",
    keys: ["1000407545.jpg", "1000928369.jpg", "1000851634.jpg"],
  },
  {
    id: "packages",
    label: "Investment / Packages",
    group: "Homepage",
    keys: ["r2.jpg", "r1.jpg", "r3.jpeg"],
  },
  {
    id: "instagram-feed",
    label: "Instagram Feed",
    group: "Homepage",
    keys: [
      "CA9A0451.JPG",
      "CA9A1588.JPG",
      "CA9A2039.JPG",
      "CA9A2577.JPG",
      "CA9A9580.JPG",
      "CA9A9996.JPG",
    ],
  },
];

/** Every distinct key across every section, in first-seen order. */
export function allSectionKeys(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const section of ADMIN_SECTIONS) {
    for (const key of section.keys) {
      if (!seen.has(key)) {
        seen.add(key);
        out.push(key);
      }
    }
  }
  return out;
}
