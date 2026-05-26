export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let slug = "";
  try {
    const body = await request.json();
    slug = body?.slug || "";
  } catch {}

  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const res = await fetch(`${API_BASE}/cms/sections/reset-seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slug }),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Reset failed" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ message: "Reset & re-seeded successfully" }); }
}
