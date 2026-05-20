export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "year";
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/reports/summary?range=${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load reports" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
