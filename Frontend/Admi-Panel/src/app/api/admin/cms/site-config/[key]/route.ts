export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function GET(_req: Request, { params }: { params: { key: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(`${API_BASE}/cms/site-config/${params.key}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Not found" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json(null); }
}

export async function PUT(request: Request, { params }: { params: { key: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const res = await fetch(`${API_BASE}/cms/site-config/${params.key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ success: true }); }
}
