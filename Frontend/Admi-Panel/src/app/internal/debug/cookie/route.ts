export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  return NextResponse.json({
    hasToken: !!token,
    length: token.length,
    preview: token ? token.slice(0, 12) + "…" : null,
  });
}
