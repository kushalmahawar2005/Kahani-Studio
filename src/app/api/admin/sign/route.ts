import { v2 as cloudinary } from "cloudinary";
import type { NextRequest } from "next/server";
import { checkAdminPasscode } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(key: string) {
  const dot = key.lastIndexOf(".");
  const base = dot > 0 ? key.slice(0, dot) : key;
  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "media"
  );
}

/**
 * Signs a direct browser → Cloudinary upload for the admin media manager.
 * The API secret never leaves the server; the browser uploads the file
 * itself (no Next body-size / timeout limits for large videos). Signing
 * a fixed public_id derived from the site's media key means re-uploading
 * overwrites the same Cloudinary asset instead of leaving orphans behind.
 */
export async function POST(req: NextRequest) {
  const authError = checkAdminPasscode(req);
  if (authError) return authError;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      {
        ok: false,
        code: "not_configured",
        error: "Cloudinary isn't configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env, then restart.",
      },
      { status: 503 }
    );
  }

  let body: { key?: string } = {};
  try {
    body = (await req.json()) as { key?: string };
  } catch {
    /* no body is fine */
  }
  if (!body.key) {
    return Response.json({ ok: false, error: "Missing key" }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "kahani-clicks";
  const publicId = slugify(body.key);
  const overwrite = true;
  const signature = cloudinary.utils.api_sign_request(
    { folder, public_id: publicId, overwrite, timestamp },
    apiSecret
  );

  return Response.json({ ok: true, cloudName, apiKey, timestamp, folder, publicId, overwrite, signature });
}
