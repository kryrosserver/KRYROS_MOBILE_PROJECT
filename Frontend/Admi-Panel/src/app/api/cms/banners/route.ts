export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function POST(request: Request) {
  const body = await request.json();
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/cms/banners`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
