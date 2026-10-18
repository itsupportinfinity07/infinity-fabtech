import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getDb } from "@/lib/firebase";

export const runtime = "nodejs";

const t = (max: number) => z.string().trim().max(max);
const schema = z.object({
  source: z.enum(["contact", "quote"]),
  name: t(120).min(2),
  company: t(160).min(2),
  phone: t(30).regex(/^[+]?[0-9\s-]{10,20}$/),
  email: t(160).email(),
  productRequirement: t(120).min(1),
  otherRequirement: t(200).optional(),
  location: t(200).optional(),
  message: t(4000).min(10),
  website: t(200).optional(), // honeypot: real visitors never fill this in
});

// Best-effort limiter (per server instance): 5 enquiries per IP per 10 minutes.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((x) => now - x < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });

  const { website, ...data } = parsed.data;
  // Bots fill the hidden field: pretend success, store nothing.
  if (website) return NextResponse.json({ ok: true });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Enquiries are temporarily unavailable. Please call or email us." }, { status: 503 });
  try {
    await db.collection("inquiries").add({ ...data, status: "new", createdAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("inquiry save failed:", e);
    return NextResponse.json({ error: "Could not send your enquiry. Please try again or call us." }, { status: 500 });
  }
}
