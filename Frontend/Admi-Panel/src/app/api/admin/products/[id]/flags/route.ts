export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const body = await request.json();
  const res = await fetch(`${API_BASE}/products/${params.id}/flags`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to update" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}
