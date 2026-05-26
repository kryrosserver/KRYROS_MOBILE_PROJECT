export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

/**
 * POST /api/admin/cms/pages/sync-all
 * Upserts all 17 platform pages into the cms_pages DB table.
 * Safe to call multiple times — existing pages are not overwritten.
 */
export async function POST() {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API_BASE}/cms/pages/seed-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed to sync pages" }, { status: res.status });
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ success: true, message: text });
  }
}
