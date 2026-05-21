export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { requireAdminToken } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export async function PUT(
  request: Request,
  { params }: { params: { key: string } }
) {
  const { key } = params;
  const body = await request.json();
  const token = (await cookies()).get("admin_token")?.value || "";

  const res = await fetch(`${API_BASE}/settings/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to update setting" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: { key: string } }
) {
  const { key } = params;
  const token = (await cookies()).get("admin_token")?.value || "";

  const res = await fetch(`${API_BASE}/settings/${key}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to delete setting" }, { status: res.status });
  }

  return NextResponse.json({ success: true });
}
