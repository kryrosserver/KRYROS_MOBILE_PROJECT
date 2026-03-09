export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function POST() {
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/products/seed`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to seed products" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
