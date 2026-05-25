export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(`${API_BASE}/cms/site-config`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json([]); }
}

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const isSeed = url.searchParams.get("action") === "seed";
  const endpoint = isSeed ? `${API_BASE}/cms/site-config/seed` : `${API_BASE}/cms/site-config`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: isSeed ? undefined : await request.text(),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ success: true }); }
}
