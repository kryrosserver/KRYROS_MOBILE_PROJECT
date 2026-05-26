import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";
import { API_BASE } from "@/lib/config";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const token = getAdminToken(req) || "";
  const { searchParams } = new URL(req.url);
  const countryId = searchParams.get("countryId");
  const url = countryId ? `${API_BASE}/states?countryId=${countryId}` : `${API_BASE}/states`;
  return proxyGet(url, token);
}

export async function POST(req: NextRequest) {
  try {
    const token = getAdminToken(req);
    const body = await req.json();
    const res = await fetch(`${API_BASE}/states`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create state" }, { status: 500 });
  }
}
