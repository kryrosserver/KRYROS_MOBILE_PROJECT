import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const take = searchParams.get("take") || "50";
  const skip = searchParams.get("skip") || "0";
  const categoryId = searchParams.get("categoryId") || "";
  const featured = searchParams.get("featured") || "";

  const url = new URL(`${API_BASE}/products`);
  if (search) url.searchParams.set("search", search);
  url.searchParams.set("take", take);
  url.searchParams.set("skip", skip);
  if (categoryId) url.searchParams.set("categoryId", categoryId);
  if (featured) url.searchParams.set("featured", featured);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load products" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
