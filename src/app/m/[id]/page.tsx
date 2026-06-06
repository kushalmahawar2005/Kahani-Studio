import { notFound } from "next/navigation";
import { getMemory } from "@/lib/memories";
import MemoryPlayer from "@/components/memory/MemoryPlayer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MemoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const memory = await getMemory(id);
  if (!memory) notFound();
  return <MemoryPlayer memory={memory} />;
}
