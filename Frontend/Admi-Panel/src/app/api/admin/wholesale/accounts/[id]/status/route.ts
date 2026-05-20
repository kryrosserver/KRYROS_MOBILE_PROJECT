import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("admin_token")?.value;
  const body = await req.json();
  
  const res = await fetch(`${API_BASE}/wholesale/accounts/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  
  return NextResponse.json(await res.json(), { status: res.status });
}
