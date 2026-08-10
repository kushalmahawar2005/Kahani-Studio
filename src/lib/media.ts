import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type MediaMap = Record<string, string>;

/**
 * All Media rows as a { "1000407545.jpg": "https://res.cloudinary.com/…" }
 * lookup, cached for an hour so pages don't hit the DB on every request.
 */
export const getMediaMap = unstable_cache(
  async (): Promise<MediaMap> => {
    try {
      const rows = await prisma.media.findMany({
        select: { key: true, url: true },
      });
      return Object.fromEntries(rows.map((r) => [r.key, r.url]));
    } catch (err) {
      // DB hiccup — fall back to local /public assets rather than taking
      // the whole site down.
      console.error("getMediaMap failed, falling back to local assets", err);
      return {};
    }
  },
  ["media-map"],
  { revalidate: 3600, tags: ["media"] }
);
