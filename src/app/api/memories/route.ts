import type { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addMemory, listMemories, MEM_PUBLIC_DIR, extFor, type Memory } from "@/lib/memories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_POSTER = 12 * 1024 * 1024; // 12 MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200 MB

export async function GET() {
  return Response.json({ ok: true, memories: await listMemories() });
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const coupleName = String(form.get("coupleName") ?? "").trim().slice(0, 80);
  const subtitle = String(form.get("subtitle") ?? "").trim().slice(0, 120);
  const event = String(form.get("event") ?? "").trim().slice(0, 40);
  const poster = form.get("poster");
  const video = form.get("video");

  if (!coupleName) return Response.json({ ok: false, error: "Name is required" }, { status: 400 });
  if (!(poster instanceof File) || !poster.type.startsWith("image/"))
    return Response.json({ ok: false, error: "A poster image is required" }, { status: 400 });
  if (!(video instanceof File) || !video.type.startsWith("video/"))
    return Response.json({ ok: false, error: "A video is required" }, { status: 400 });
  if (poster.size > MAX_POSTER)
    return Response.json({ ok: false, error: "Poster too large (max 12MB)" }, { status: 400 });
  if (video.size > MAX_VIDEO)
    return Response.json({ ok: false, error: "Video too large (max 200MB)" }, { status: 400 });

  const id = `mem_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const dir = path.join(MEM_PUBLIC_DIR, id);
  await fs.mkdir(dir, { recursive: true });

  const posterName = `poster${extFor(poster)}`;
  const videoName = `video${extFor(video)}`;
  await fs.writeFile(path.join(dir, posterName), Buffer.from(await poster.arrayBuffer()));
  await fs.writeFile(path.join(dir, videoName), Buffer.from(await video.arrayBuffer()));

  const memory: Memory = {
    id,
    coupleName,
    subtitle,
    event,
    poster: `/memories/${id}/${posterName}`,
    video: `/memories/${id}/${videoName}`,
    createdAt: Date.now(),
  };
  await addMemory(memory);

  return Response.json({ ok: true, memory });
}
