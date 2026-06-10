import { v2 as cloudinary } from "cloudinary";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/*
 * Signs a direct browser → Cloudinary upload. The API secret never leaves the
 * server; the browser uploads the file itself (no Next body-size / timeout
 * limits). Params signed here must exactly match what the client sends.
 */
export async function POST(req: NextRequest) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      {
        ok: false,
        code: "not_configured",
        error:
          "Cloudinary isn't configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.local, then restart.",
      },
      { status: 503 }
    );
  }

  let body: { passcode?: string } = {};
  try {
    body = (await req.json()) as { passcode?: string };
  } catch {
    /* no body is fine */
  }

  const required = process.env.UPLOAD_PASSCODE;
  if (required && body.passcode !== required) {
    return Response.json(
      { ok: false, code: "unauthorized", error: "Wrong passcode." },
      { status: 401 }
    );
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "reels";
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    apiSecret
  );

  return Response.json({
    ok: true,
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  });
}
