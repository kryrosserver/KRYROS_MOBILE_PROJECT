import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { API_BASE } from "@/lib/config";

}

export async function GET(req: NextRequest) {
  try {
    const token = getAdminToken(req);
    const res = await fetch(`${API_BASE}/shipping-zones`, { 
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store" 
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAdminToken(req);
    const body = await req.json();
    const res = await fetch(`${API_BASE}/shipping-zones`, {
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
    return NextResponse.json({ error: "Failed to create zone" }, { status: 500 });
  }
}
