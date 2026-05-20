import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  const url = new URL(`${API_BASE}/orders`);
  url.searchParams.set("take", "50");
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load orders" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
