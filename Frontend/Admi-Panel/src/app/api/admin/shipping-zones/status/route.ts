import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { requireAdminToken } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authResult = requireAdminToken(req);
  if (authResult instanceof NextResponse) return authResult;
  const token = authResult.token;
  try {
    const res = await fetch(`${API_BASE}/shipping-zones/status`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shipping status" }, { status: 500 });
  }
}
