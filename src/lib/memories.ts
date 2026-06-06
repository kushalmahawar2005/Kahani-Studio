// "Living photo" memories — server-side store.
// MVP persistence: a JSON index in /data + uploaded media in /public/memories.
// (Swap addMemory's file-write for Cloudinary later; the shape stays the same.)
import { promises as fs } from "fs";
import path from "path";

export interface Memory {
  id: string;
  coupleName: string;
  subtitle: string;
  /** Ceremony / event type, e.g. "Wedding", "Haldi". */
  event: string;
  /** Public paths, served by Next from /public. */
  poster: string;
  video: string;
  createdAt: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB = path.join(DATA_DIR, "memories.json");
export const MEM_PUBLIC_DIR = path.join(process.cwd(), "public", "memories");

async function readDb(): Promise<Memory[]> {
  try {
    const raw = await fs.readFile(DB, "utf8");
    return JSON.parse(raw) as Memory[];
  } catch {
    return [];
  }
}

async function writeDb(list: Memory[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB, JSON.stringify(list, null, 2), "utf8");
}

export async function listMemories(): Promise<Memory[]> {
  const list = await readDb();
  return list.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getMemory(id: string): Promise<Memory | null> {
  const list = await readDb();
  return list.find((m) => m.id === id) ?? null;
}

export async function addMemory(m: Memory) {
  const list = await readDb();
  list.push(m);
  await writeDb(list);
}

export async function deleteMemory(id: string): Promise<boolean> {
  const list = await readDb();
  const next = list.filter((m) => m.id !== id);
  if (next.length === list.length) return false;
  await writeDb(next);
  // best-effort cleanup of uploaded files
  await fs.rm(path.join(MEM_PUBLIC_DIR, id), { recursive: true, force: true }).catch(() => {});
  return true;
}

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/webm": ".webm",
};

export function extFor(file: File): string {
  if (EXT[file.type]) return EXT[file.type];
  const fromName = path.extname(file.name).toLowerCase();
  return fromName || (file.type.startsWith("video/") ? ".mp4" : ".jpg");
}
