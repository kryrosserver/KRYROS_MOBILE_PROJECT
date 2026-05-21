import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { parseBackendError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: body.identifier }),
      cache: "no-store",
    });

    if (!res.ok) {
      const message = await parseBackendError(res);
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
