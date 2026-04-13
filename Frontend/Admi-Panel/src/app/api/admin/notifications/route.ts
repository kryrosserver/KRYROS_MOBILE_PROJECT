export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const body = await request.json();
  
  // Determine if it's a broadcast or a targeted send based on the payload or a header
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "send"; // "broadcast" or "send"
  
  const res = await fetch(`${API_BASE}/notifications/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ message: text || "Failed to send notification" }, { status: res.status });
  }
  
  try {
    return NextResponse.json(JSON.parse(text));
  } catch (e) {
    return NextResponse.json({ success: true });
  }
}
