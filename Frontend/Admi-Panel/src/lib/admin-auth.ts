import { NextRequest, NextResponse } from "next/server";

export function getAdminToken(req: NextRequest): string {
  return req.cookies.get("admin_token")?.value || "";
}

export function requireAdminToken(req: NextRequest): { token: string } | NextResponse {
  const token = getAdminToken(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { token };
}
