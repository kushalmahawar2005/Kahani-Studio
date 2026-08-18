"use client";
import { createContext, useContext } from "react";
import type { MediaMap } from "@/lib/media";

const MediaContext = createContext<MediaMap>({});

export function MediaProvider({
  map,
  children,
}: {
  map: MediaMap;
  children: React.ReactNode;
}) {
  return <MediaContext.Provider value={map}>{children}</MediaContext.Provider>;
}

/** Raw {filename: url} map — use this when resolving several items inside
 * a .map() (calling useMedia per-item there would violate rules of hooks). */
export function useMediaMap(): MediaMap {
  return useContext(MediaContext);
}

/**
 * Resolves a local /public filename (e.g. "1000407545.jpg", no leading
 * slash) to its Cloudinary URL. Falls back to the local /public copy if the
 * DB doesn't have it yet, so nothing ever breaks.
 */
export function useMedia(filename: string): string {
  const map = useContext(MediaContext);
  return resolveMedia(map, filename);
}

/** Non-hook resolver for use inside .map()/loops with a map from useMediaMap(). */
export function resolveMedia(map: MediaMap, filename: string): string {
  return map[filename] ?? `/${filename}`;
}

/** Request an appropriately sized, modern-format Cloudinary image when a
 * component needs a native <img> (for example, the variable-height masonry
 * gallery). Local fallback URLs are returned unchanged. */
export function optimizeCloudinaryImage(src: string, width: number): string {
  const marker = "/image/upload/";
  if (!src.startsWith("https://res.cloudinary.com/") || !src.includes(marker)) {
    return src;
  }

  const [base, asset] = src.split(marker);
  return `${base}${marker}f_auto,q_auto:eco,w_${width},c_limit/${asset}`;
}
