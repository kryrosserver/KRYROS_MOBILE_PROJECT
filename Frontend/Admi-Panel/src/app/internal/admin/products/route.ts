export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET() {
  const url = new URL(`${API_BASE}/products`);
  url.searchParams.set("take", "20");
  url.searchParams.set("showInactive", "true");
  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load products" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}

export async function POST(request: Request) {
  const body = await request.json().catch(async () => {
    const txt = await request.text();
    try { return JSON.parse(txt); } catch { return {}; }
  });
  const t = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to create product" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
