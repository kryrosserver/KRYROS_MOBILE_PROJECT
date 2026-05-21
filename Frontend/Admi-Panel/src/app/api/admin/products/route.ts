export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { requireAdminToken } from "@/lib/admin-auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const authResult = requireAdminToken(req);
  if (authResult instanceof NextResponse) return authResult;
  const token = authResult.token;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const take = searchParams.get("take") || "20";
  const skip = searchParams.get("skip") || "0";
  const categoryId = searchParams.get("categoryId") || "";
  const featured = searchParams.get("featured") || "";
  const allowCredit = searchParams.get("allowCredit") || "";
  const showInactive = searchParams.get("showInactive") || "true";

  const url = new URL(`${API_BASE}/products`);
  if (search) url.searchParams.set("search", search);
  url.searchParams.set("take", take);
  url.searchParams.set("skip", skip);
  if (categoryId) url.searchParams.set("categoryId", categoryId);
  if (featured) url.searchParams.set("featured", featured);
  if (allowCredit) url.searchParams.set("allowCredit", allowCredit);
  if (showInactive) url.searchParams.set("showInactive", showInactive);

  const res = await fetch(url.toString(), { 
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 } // Cache for 30 seconds to speed up repeated loads
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load products" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}

export async function POST(req: NextRequest) {
  const authResult = requireAdminToken(req);
  if (authResult instanceof NextResponse) return authResult;
  const token = authResult.token;
  
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (e) {
    const json = await req.json();
    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(json),
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: text || "Failed to create product" }, { status: res.status });
    }
    return NextResponse.json(JSON.parse(text));
  }

  const res = await fetch(`${API_BASE}/products/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to create product" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
