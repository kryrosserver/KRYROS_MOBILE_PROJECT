export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

/**
 * POST /api/admin/cms/pages/[id]/sections/reset-seed
 * Wipes all existing sections for the given page slug and re-seeds
 * the correct sections for the current frontend.
 *
 * For slug "home": wipes homepage_sections and re-seeds all 14 sections.
 * For all other slugs: wipes cms_sections where pageSlug=slug and re-seeds.
 *
 * SAFE: does NOT touch cms_banners, cms_site_configs, or other tables.
 */
export async function POST(_: Request, { params }: { params: { id: string } }) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = params.id;

  // Home page uses its own dedicated reset-seed endpoint
  if (slug === "home") {
    const res = await fetch(`${API_BASE}/cms/homepage-sections/reset-seed`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
    try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ success: true, message: text }); }
  }

  // All other pages use the generic sections reset-seed
  const res = await fetch(`${API_BASE}/cms/sections/reset-seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ slug }),
  });
  const text = await res.text();
  if (!res.ok) return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ success: true, message: text }); }
}
