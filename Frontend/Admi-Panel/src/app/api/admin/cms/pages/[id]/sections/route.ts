export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const slug = params.id;

  // Home page sections live in homepage_sections table
  if (slug === "home") {
    const res = await fetch(`${API_BASE}/cms/homepage-sections/manage`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
    try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json([]); }
  }

  // All other pages: filter cms_sections by pageSlug server-side
  const res = await fetch(`${API_BASE}/cms/sections/manage?pageSlug=${encodeURIComponent(slug)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json([]); }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const slug = params.id;
  const endpoint = slug === "home"
    ? `${API_BASE}/cms/homepage-sections`
    : `${API_BASE}/cms/sections`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...body, pageSlug: slug }),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  return NextResponse.json(JSON.parse(text));
}
