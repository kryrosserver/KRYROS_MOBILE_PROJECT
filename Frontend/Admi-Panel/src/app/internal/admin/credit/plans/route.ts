export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET() {
  const res = await fetch(`${API_BASE}/credit/plans`, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) return NextResponse.json([], { status: res.status });
  return NextResponse.json(JSON.parse(text));
}

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const body = await request.json().catch(() => ({}));
  const res = await fetch(`${API_BASE}/credit/plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text }, { status: res.status });
  return NextResponse.json(JSON.parse(text));
}
