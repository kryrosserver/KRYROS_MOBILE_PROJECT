import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

function getAdminToken(req: NextRequest): string {
  const token = req.cookies.get("admin_token")?.value;
  return token || "";
}

export async function GET(req: NextRequest) {
  const token = getAdminToken(req);
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const take = searchParams.get("take") || "50";
  const skip = searchParams.get("skip") || "0";
  const categoryId = searchParams.get("categoryId") || "";
  const featured = searchParams.get("featured") || "";
  const allowCredit = searchParams.get("allowCredit") || "";
  const showInactive = searchParams.get("showInactive") || "";

  const url = new URL(`${API_BASE}/products`);
  if (search) url.searchParams.set("search", search);
  url.searchParams.set("take", take);
  url.searchParams.set("skip", skip);
  if (categoryId) url.searchParams.set("categoryId", categoryId);
  if (featured) url.searchParams.set("featured", featured);
  if (allowCredit) url.searchParams.set("allowCredit", allowCredit);
  if (showInactive) url.searchParams.set("showInactive", showInactive);

  const res = await fetch(url.toString(), { 
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store" 
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load products" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}

export async function POST(req: NextRequest) {
  const token = getAdminToken(req);
  const body = await req.json();
  
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  
  const data = await res.json();
  return NextResponse.json(data);
}
