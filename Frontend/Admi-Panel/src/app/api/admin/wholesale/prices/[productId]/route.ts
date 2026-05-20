import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const token = req.cookies.get("admin_token")?.value;
  const body = await req.json();
  
  const res = await fetch(`${API_BASE}/wholesale/prices/${productId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const res = await fetch(`${API_BASE}/wholesale/prices/${productId}`, {
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
