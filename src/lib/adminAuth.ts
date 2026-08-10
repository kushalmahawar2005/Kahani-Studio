import type { NextRequest } from "next/server";

/**
 * Unlike /api/cloudinary-sign (open unless UPLOAD_PASSCODE is set), the
 * admin surface can delete/replace live site media — so it's locked by
 * default. ADMIN_PASSCODE must be set for any admin route to work.
 */
export function checkAdminPasscode(req: NextRequest): Response | null {
  const required = process.env.ADMIN_PASSCODE;
  if (!required) {
    return Response.json(
      {
        ok: false,
        code: "not_configured",
        error: "ADMIN_PASSCODE isn't set. Add it to .env, then restart.",
      },
      { status: 503 }
    );
  }
  const given = req.headers.get("x-admin-passcode");
  if (given !== required) {
    return Response.json({ ok: false, code: "unauthorized", error: "Wrong passcode." }, { status: 401 });
  }
  return null;
}
