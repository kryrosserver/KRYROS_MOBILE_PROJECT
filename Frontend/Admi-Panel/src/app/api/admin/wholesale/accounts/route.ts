import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { requireAdminToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authResult = requireAdminToken(req);
  if (authResult instanceof NextResponse) return authResult;
  const token = authResult.token;
  const res = await fetch(`${API_BASE}/wholesale/accounts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
