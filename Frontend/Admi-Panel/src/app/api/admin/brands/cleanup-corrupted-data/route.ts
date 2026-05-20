import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

function getAdminToken(req: NextRequest): string {
  const token = req.cookies.get("admin_token")?.value;
  return token || "";
}

export async function POST(req: NextRequest) {
  const token = getAdminToken(req);
  
  const res = await fetch(`${API_BASE}/brands/cleanup-corrupted-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  
  const data = await res.json();
  return NextResponse.json(data);
}
