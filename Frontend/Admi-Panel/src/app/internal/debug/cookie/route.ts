import { NextResponse } from "next/server";

// Debug endpoint removed — leaking token previews is a security risk.
export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
