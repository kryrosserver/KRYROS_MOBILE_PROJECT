export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { API_BASE, isApiConfigured } from "@/lib/config";
import { cookies } from "next/headers";
import { proxyFetch, BackendTimeoutError, timeoutError } from "@/lib/proxy";

export async function GET(request: NextRequest) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const { searchParams } = new URL(request.url);
  const url = new URL(`${API_BASE}/products`);
  const take = searchParams.get("take") || searchParams.get("limit") || "200";
  const skip = searchParams.get("skip") || searchParams.get("offset") || "0";
  url.searchParams.set("take", take);
  url.searchParams.set("skip", skip);
  url.searchParams.set("showInactive", searchParams.get("showInactive") || "true");
  if (searchParams.get("search")) url.searchParams.set("search", searchParams.get("search")!);
  if (searchParams.get("categoryId")) url.searchParams.set("categoryId", searchParams.get("categoryId")!);
  if (searchParams.get("featured")) url.searchParams.set("featured", searchParams.get("featured")!);
  if (searchParams.get("allowCredit")) url.searchParams.set("allowCredit", searchParams.get("allowCredit")!);

  try {
    const res = await proxyFetch(url.toString(), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: text || "Failed to load products" }, { status: res.status });
    }
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ error: "Invalid JSON from backend", raw: text }, { status: 502 });
    }
  } catch (err: unknown) {
    if (err instanceof BackendTimeoutError) return timeoutError(url.toString());
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  let isFormData = false;
  let body: any;
  try {
    body = await request.formData();
    isFormData = true;
  } catch {
    try {
      const txt = await (request as any).text();
      body = JSON.parse(txt);
    } catch { body = {}; }
  }

  const endpoint = isFormData ? `${API_BASE}/products/upload` : `${API_BASE}/products`;
  try {
    const res = await proxyFetch(endpoint, {
      method: "POST",
      headers: isFormData
        ? { Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: isFormData ? body : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: text || "Failed to create product" }, { status: res.status });
    }
    return NextResponse.json(JSON.parse(text));
  } catch (err: unknown) {
    if (err instanceof BackendTimeoutError) return timeoutError(endpoint);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
