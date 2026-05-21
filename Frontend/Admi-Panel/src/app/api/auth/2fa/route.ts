import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { parseBackendError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { twoFactorToken: string; code: string };

    if (!body.twoFactorToken || !body.code) {
      return NextResponse.json(
        { success: false, error: "Token and code are required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/auth/2fa/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ twoFactorToken: body.twoFactorToken, code: body.code }),
    });

    if (!res.ok) {
      const message = await parseBackendError(res);
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    const data = await res.json() as {
      accessToken: string;
      refreshToken: string;
      user: Record<string, unknown>;
    };

    const response = NextResponse.json({ success: true, user: data.user });

    response.cookies.set("admin_token", data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15,
    });

    response.cookies.set("admin_refresh_token", data.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
