import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { parseBackendError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.token || !body.newPassword) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: body.token, newPassword: body.newPassword }),
      cache: "no-store",
    });

    if (!res.ok) {
      const message = await parseBackendError(res);
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
