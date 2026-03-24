import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET(req: NextRequest) {
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
