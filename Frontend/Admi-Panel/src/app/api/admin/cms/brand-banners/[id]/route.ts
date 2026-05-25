export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const res = await fetch(`${API_BASE}/cms/brand-banners/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ success: true }); }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(`${API_BASE}/cms/brand-banners/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return NextResponse.json({ error: "Failed" }, { status: res.status });
  return NextResponse.json({ success: true });
}
