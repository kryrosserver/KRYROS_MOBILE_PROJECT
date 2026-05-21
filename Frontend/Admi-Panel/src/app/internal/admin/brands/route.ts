export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET() {
  const res = await fetch(`${API_BASE}/brands`, { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ data: [] }, { status: res.status });
  return NextResponse.json(JSON.parse(text));
}
