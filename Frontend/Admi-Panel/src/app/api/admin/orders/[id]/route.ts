import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to fetch order" }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to update order" }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
