import { NextRequest } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";
import { API_BASE } from "@/lib/config";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const token = getAdminToken(req) || "";
  return proxyGet(`${API_BASE}/reviews`, token);
}
