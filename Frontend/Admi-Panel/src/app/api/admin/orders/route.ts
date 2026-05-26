import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";
import { proxyGet } from "@/lib/proxy";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(`${API_BASE}/orders`);
  url.searchParams.set("take", "50");
  return proxyGet(url.toString(), token);
}
