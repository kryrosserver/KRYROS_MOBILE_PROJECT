import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";
import { API_BASE } from "@/lib/config";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const token = getAdminToken(req) || "";
  return proxyGet(`${API_BASE}/countries`, token);
}

export async function POST(req: NextRequest) {
  try {
    const token = getAdminToken(req);
    const body = await req.json();
    const res = await fetch(`${API_BASE}/countries`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create country" }, { status: 500 });
  }
}
