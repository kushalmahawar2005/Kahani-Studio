"use client";

/** Longest side an embedded photo is downscaled to. Plenty for 300 DPI print
 * on any magazine slot, keeps PDFs fast to build and download. */
const MAX_DIMENSION = 2800;
const JPEG_QUALITY = 0.9;

export type NormalizedImage = {
  dataUrl: string;
  width: number;
  height: number;
};

/**
 * Re-encodes any browser-decodable image (HEIC, WEBP, AVIF, odd PNGs, …)
 * into a plain baseline JPEG via canvas.
 *
 * This exists because @react-pdf/renderer's <Image> only understands PNG
 * and JPEG — a phone photo in another format previews fine in a plain
 * <img> (browsers are lenient) but silently fails to embed in the PDF.
 * Normalizing at upload time guarantees whatever we store always works in
 * both the on-screen preview and the print export.
 */
export function normalizeImage(file: File): Promise<NormalizedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      resolve({ dataUrl: canvas.toDataURL("image/jpeg", JPEG_QUALITY), width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not decode "${file.name}" — try a different photo.`));
    };

    img.src = objectUrl;
  });
}
