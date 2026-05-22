import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";
import { API_BASE } from "@/lib/config";

export async function GET(req: NextRequest) {
  const token = getAdminToken(req);
  const res = await fetch(`${API_BASE}/reviews`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}
