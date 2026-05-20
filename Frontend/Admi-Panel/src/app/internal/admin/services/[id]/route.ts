export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const bodyText = await _.text();
  const res = await fetch(`${API_BASE}/services/${params.id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: bodyText,
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed to update service" }, { status: res.status });
  return NextResponse.json(JSON.parse(text));
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/services/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed to delete service" }, { status: res.status });
  return NextResponse.json(JSON.parse(text || "{}"));
}
