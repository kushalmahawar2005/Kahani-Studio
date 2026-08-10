"use client";

import { toPng } from "html-to-image";

/** Snapshots a DOM node (the on-screen post canvas) to a PNG at a target
 * pixel width and triggers a browser download. Using the exact rendered
 * DOM means the export always matches what the user sees — no separate
 * renderer to keep in sync, unlike the print PDF. */
export async function exportNodeAsPng(
  node: HTMLElement,
  targetWidth: number,
  filename: string
) {
  const pixelRatio = targetWidth / node.clientWidth;
  const dataUrl = await toPng(node, { pixelRatio, cacheBust: true });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
