import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";
import { API_BASE } from "@/lib/config";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getAdminToken(req);
  const res = await fetch(`${API_BASE}/reviews/${params.id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  return NextResponse.json({ success: true });
}
