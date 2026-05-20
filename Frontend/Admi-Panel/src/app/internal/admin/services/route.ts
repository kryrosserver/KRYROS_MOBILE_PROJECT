export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/services/manage/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load services" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
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
