import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { requireAdminToken } from "@/lib/admin-auth";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const authResult = requireAdminToken(req);
  if (authResult instanceof NextResponse) return authResult;
  const token = authResult.token;
  return proxyGet(`${API_BASE}/wholesale/accounts`, token);
}
