import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_TO = "J.k.sankhla123@gmail.com";
const DEFAULT_FROM = "Kahani Clicks <onboarding@resend.dev>";

type Payload = {
  name?: string;
  email?: string;
  event?: string;
  date?: string;
  budget?: string;
  message?: string;
  /* honeypot — real users leave this empty */
  hp?: string;
};

const ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ESCAPE[c]);
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function clamp(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

export async function POST(req: NextRequest) {
  let body: Payload | null = null;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return Response.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }
  if (!body) {
    return Response.json(
      { ok: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  /* Honeypot — silently accept so bots think it worked. */
  if (body.hp && body.hp.trim().length > 0) {
    return Response.json({ ok: true });
  }

  const name = clamp(body.name, 200);
  const email = clamp(body.email, 200);
  const message = clamp(body.message, 5000);
  const event = clamp(body.event, 80);
  const date = clamp(body.date, 40);
  const budget = clamp(body.budget, 80);

  if (!name || !email || !message) {
    return Response.json(
      { ok: false, error: "Name, email, and message are required." },
      { status: 400 }
    );
  }
  if (!isEmail(email)) {
    return Response.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    /* Service not configured — let the client fall back to mailto. */
    return Response.json(
      { ok: false, code: "not_configured", error: "Email service is not configured yet." },
      { status: 503 }
    );
  }

  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO;
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM;

  const html = `
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:620px;margin:0 auto;color:#1a1a1a;background:#F9F9EA;padding:32px;border-radius:12px">
      <p style="font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#999;margin:0 0 8px">New Inquiry</p>
      <h1 style="font-style:italic;font-weight:400;font-size:28px;margin:0 0 24px">Kahani Clicks</h1>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;width:120px;color:#999">Name</td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding:6px 0;color:#999">Email</td><td><a href="mailto:${escapeHtml(email)}" style="color:#1a1a1a">${escapeHtml(email)}</a></td></tr>
        ${event ? `<tr><td style="padding:6px 0;color:#999">Event</td><td>${escapeHtml(event)}</td></tr>` : ""}
        ${date ? `<tr><td style="padding:6px 0;color:#999">Date</td><td>${escapeHtml(date)}</td></tr>` : ""}
        ${budget ? `<tr><td style="padding:6px 0;color:#999">Budget</td><td>${escapeHtml(budget)}</td></tr>` : ""}
      </table>
      <hr style="border:none;border-top:1px solid rgba(0,0,0,0.1);margin:24px 0" />
      <p style="white-space:pre-wrap;line-height:1.7;font-size:15px;margin:0">${escapeHtml(message)}</p>
    </div>
  `;

  const text =
    `New inquiry — Kahani Clicks\n\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    (event ? `Event: ${event}\n` : "") +
    (date ? `Date: ${date}\n` : "") +
    (budget ? `Budget: ${budget}\n` : "") +
    `\n${message}\n`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New inquiry · ${name}${event ? ` · ${event}` : ""}`,
        html,
        text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Resend send failed", res.status, detail);
      return Response.json(
        { ok: false, error: "Could not send right now. Please email or WhatsApp us." },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Resend network error", err);
    return Response.json(
      { ok: false, error: "Network issue while sending. Please try again." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
