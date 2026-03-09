export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET() {
  const url = new URL(`${API_BASE}/products`);
  url.searchParams.set("take", "50");
  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load products" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
