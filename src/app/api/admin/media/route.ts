import { v2 as cloudinary } from "cloudinary";
import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { checkAdminPasscode } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** List every media row (key, url, type, dimensions) for the admin grid. */
export async function GET(req: NextRequest) {
  const authError = checkAdminPasscode(req);
  if (authError) return authError;

  const rows = await prisma.media.findMany({ orderBy: { key: "asc" } });
  return Response.json({ ok: true, rows });
}

type UpsertBody = {
  key?: string;
  url?: string;
  publicId?: string;
  type?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

/** Replace the file behind an existing key (or add a new one) after the
 * browser has already uploaded it to Cloudinary via /api/admin/sign. */
export async function POST(req: NextRequest) {
  const authError = checkAdminPasscode(req);
  if (authError) return authError;

  let body: UpsertBody;
  try {
    body = (await req.json()) as UpsertBody;
  } catch {
    return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const { key, url, publicId, type } = body;
  if (!key || !url || !publicId || (type !== "image" && type !== "video")) {
    return Response.json({ ok: false, error: "Missing key, url, publicId or type" }, { status: 400 });
  }

  const previous = await prisma.media.findUnique({ where: { key } });

  await prisma.media.upsert({
    where: { key },
    create: {
      key,
      url,
      publicId,
      type,
      width: body.width ?? null,
      height: body.height ?? null,
      bytes: body.bytes ?? null,
    },
    update: {
      url,
      publicId,
      type,
      width: body.width ?? null,
      height: body.height ?? null,
      bytes: body.bytes ?? null,
    },
  });

  // Clean up the old Cloudinary asset now that a new one has replaced it.
  if (previous && previous.publicId !== publicId) {
    try {
      await cloudinary.uploader.destroy(previous.publicId, { resource_type: previous.type });
    } catch (err) {
      console.error("Failed to destroy replaced Cloudinary asset", err);
    }
  }

  revalidateTag("media", { expire: 0 });
  return Response.json({ ok: true });
}

/** Removes a media row — the site falls back to its bundled /public copy
 * for that key, so deleting here never leaves a broken image on the site. */
export async function DELETE(req: NextRequest) {
  const authError = checkAdminPasscode(req);
  if (authError) return authError;

  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return Response.json({ ok: false, error: "Missing key" }, { status: 400 });
  }

  const row = await prisma.media.findUnique({ where: { key } });
  if (!row) {
    return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  await prisma.media.delete({ where: { key } });

  try {
    await cloudinary.uploader.destroy(row.publicId, { resource_type: row.type });
  } catch (err) {
    console.error("Failed to destroy deleted Cloudinary asset", err);
  }

  revalidateTag("media", { expire: 0 });
  return Response.json({ ok: true });
}
