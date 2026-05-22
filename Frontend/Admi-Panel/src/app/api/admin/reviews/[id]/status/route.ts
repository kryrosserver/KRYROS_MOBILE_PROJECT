import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";
import { API_BASE } from "@/lib/config";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getAdminToken(req);
  const body = await req.json();
  const res = await fetch(`${API_BASE}/reviews/${params.id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
