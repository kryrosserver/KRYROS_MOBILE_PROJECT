export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

/**
 * POST /api/admin/cms/homepage-sections/reset-seed
 * Wipes ALL existing homepage_sections rows and re-seeds the correct
 * sections for the current User-UI frontend.
 * Preserves: cms_banners (hero banners), cms_site_configs, and all other tables.
 */
export async function POST() {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API_BASE}/cms/homepage-sections/reset-seed`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed to reset & seed" }, { status: res.status });
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ success: true, message: text });
  }
}
