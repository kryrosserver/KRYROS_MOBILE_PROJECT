export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET() {
  const res = await fetch(`${API_BASE}/settings/shipping`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to load shipping settings" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { key, value } = body;
  
  const token = (await cookies()).get("admin_token")?.value || "";
  
  const res = await fetch(`${API_BASE}/settings/${key}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ value: String(value) }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to update setting" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
