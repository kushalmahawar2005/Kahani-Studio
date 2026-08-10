/**
 * One-off migration: upload every actively-referenced file in /public to
 * Cloudinary, then upsert its URL into the Media table.
 *
 * Run with: npx tsx scripts/upload-media.ts
 */
import "dotenv/config";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const VIDEO_EXT = new Set([".mp4", ".mov", ".webm"]);

// Every file under /public that's actually referenced in src/.
const FILES = ["s2.mp4"];

// cloudinary.uploader.upload_large(), when called without a callback, can
// hand back an UploadStream instead of a Promise — awaiting that resolves
// to an incomplete object with no secure_url. Force the callback form.
function uploadLarge(
  filePath: string,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(filePath, options, (error, result) => {
      if (error || !result) reject(error ?? new Error("Upload returned no result"));
      else resolve(result);
    });
  });
}

function slugify(filename: string) {
  const ext = path.extname(filename);
  return path
    .basename(filename, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log(`Uploading ${FILES.length} files to Cloudinary…\n`);

  for (const [i, filename] of FILES.entries()) {
    const ext = path.extname(filename).toLowerCase();
    const isVideo = VIDEO_EXT.has(ext);
    const filePath = path.join(process.cwd(), "public", filename);
    const publicId = slugify(filename);
    const prefix = `[${i + 1}/${FILES.length}]`;

    try {
      const result = isVideo
        ? await uploadLarge(filePath, {
            resource_type: "video",
            folder: "kahani-clicks",
            public_id: publicId,
            overwrite: true,
          })
        : await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
            folder: "kahani-clicks",
            public_id: publicId,
            overwrite: true,
          });

      await prisma.media.upsert({
        where: { key: filename },
        create: {
          key: filename,
          url: result.secure_url,
          publicId: result.public_id,
          type: isVideo ? "video" : "image",
          width: result.width ?? null,
          height: result.height ?? null,
          bytes: result.bytes ?? null,
        },
        update: {
          url: result.secure_url,
          publicId: result.public_id,
          type: isVideo ? "video" : "image",
          width: result.width ?? null,
          height: result.height ?? null,
          bytes: result.bytes ?? null,
        },
      });

      console.log(`${prefix} ✓ ${filename} → ${result.secure_url}`);
    } catch (err) {
      console.error(`${prefix} ✗ ${filename} failed:`, err);
      process.exitCode = 1;
    }
  }

  await prisma.$disconnect();
  console.log("\nDone.");
}

main();
