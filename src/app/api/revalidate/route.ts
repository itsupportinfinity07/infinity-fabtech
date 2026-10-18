import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

const ALLOWED = new Set(["projects", "locations", "jobs", "pages", "products", "services", "testimonials"]);

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tags } = (await req.json().catch(() => ({}))) as { tags?: string[] };
  const valid = (tags ?? []).filter((t) => ALLOWED.has(t));
  valid.forEach((t) => revalidateTag(t));
  return NextResponse.json({ revalidated: valid });
}
