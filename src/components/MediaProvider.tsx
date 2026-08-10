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
