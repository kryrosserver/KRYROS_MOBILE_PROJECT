export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE, isApiConfigured } from "@/lib/config";
import { cookies } from "next/headers";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const body = await request.json().catch(() => ({}));
  const res = await fetch(`${API_BASE}/credit/plans/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text }, { status: res.status });
  return NextResponse.json(JSON.parse(text));
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/credit/plans/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return NextResponse.json({ error: "Failed to delete plan" }, { status: res.status });
  return NextResponse.json({ success: true });
}
