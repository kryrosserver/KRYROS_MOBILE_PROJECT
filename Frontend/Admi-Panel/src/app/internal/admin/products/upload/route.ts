export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const form = await request.formData();
  const res = await fetch(`${API_BASE}/products/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to create product" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
