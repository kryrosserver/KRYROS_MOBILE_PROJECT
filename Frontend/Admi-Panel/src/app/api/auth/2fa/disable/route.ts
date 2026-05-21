import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { parseBackendError } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json() as { code: string };
    if (!body.code) {
      return NextResponse.json({ success: false, error: "Authenticator code is required" }, { status: 400 });
    }

    const res = await fetch(`${API_BASE}/auth/2fa/disable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code: body.code }),
    });

    if (!res.ok) {
      const message = await parseBackendError(res);
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
