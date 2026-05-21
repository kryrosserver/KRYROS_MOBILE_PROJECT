import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { parseBackendError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.identifier || !body.password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: body.identifier, password: body.password }),
    });

    if (!res.ok) {
      const message = await parseBackendError(res);
      return NextResponse.json(
        { success: false, error: message },
        { status: res.status }
      );
    }

    const data = await res.json() as {
      requiresTwoFactor?: boolean;
      twoFactorToken?: string;
      accessToken?: string;
      refreshToken?: string;
      user?: Record<string, unknown>;
    };

    if (data.requiresTwoFactor && data.twoFactorToken) {
      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        twoFactorToken: data.twoFactorToken,
      });
    }

    const response = NextResponse.json({ success: true, user: data.user });

    response.cookies.set("admin_token", data.accessToken!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 15,
    });

    response.cookies.set("admin_refresh_token", data.refreshToken!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
