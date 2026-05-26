import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";
import { proxyGet } from "@/lib/proxy";

const ALLOWED_NEWSLETTER_TYPES = new Set(["list", "active"]);

export async function GET(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawType = url.searchParams.get("type") || "list";

  if (!ALLOWED_NEWSLETTER_TYPES.has(rawType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return proxyGet(`${API_BASE}/newsletter/${rawType}`, token);
}
