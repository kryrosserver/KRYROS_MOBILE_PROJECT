import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

const ALLOWED_NEWSLETTER_TYPES = new Set(["list", "active"]);

export async function GET(request: Request) {
  const token = cookies().get("admin_token")?.value || "";

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const rawType = url.searchParams.get("type") || "list";

  if (!ALLOWED_NEWSLETTER_TYPES.has(rawType)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const res = await fetch(`${API_BASE}/newsletter/${rawType}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ message: data.message || "Failed to fetch newsletter data" }, { status: res.status });
  }
  
  return NextResponse.json(data);
}
