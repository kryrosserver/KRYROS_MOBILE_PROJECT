import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  const res = await fetch(`${API_BASE}/wholesale/accounts`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
