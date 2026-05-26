export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";
import { proxyGet } from "@/lib/proxy";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  return proxyGet(`${API_BASE}/services/manage/all`, token);
}

export async function POST(request: Request) {
  const body = await request.text();
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/services`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to create service" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
