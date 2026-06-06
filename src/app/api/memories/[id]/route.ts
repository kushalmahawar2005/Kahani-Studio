import { deleteMemory, getMemory } from "@/lib/memories";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memory = await getMemory(id);
  if (!memory) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  return Response.json({ ok: true, memory });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const removed = await deleteMemory(id);
  if (!removed) return Response.json({ ok: false, error: "Not found" }, { status: 404 });
  return Response.json({ ok: true });
}
