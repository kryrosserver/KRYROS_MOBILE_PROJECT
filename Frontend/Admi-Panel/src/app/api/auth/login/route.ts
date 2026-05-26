import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { parseBackendError } from "@/lib/api";
import { proxyFetch, BackendTimeoutError } from "@/lib/proxy";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "MANAGER"];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.identifier || !body.password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    let res: Response;
    try {
      res = await proxyFetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: body.identifier, password: body.password }),
      });
    } catch (err) {
      if (err instanceof BackendTimeoutError) {
        return NextResponse.json(
          { success: false, error: "The server is starting up (cold start). Please wait a few seconds and try again." },
          { status: 503 }
        );
      }
      throw err;
    }

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

    const userRole = data.user?.role as string | undefined;
    if (!userRole || !ADMIN_ROLES.includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Access denied. This portal is for administrators only." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true, user: data.user });

    response.cookies.set("admin_token", data.accessToken!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
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
      { success: false, error: "Unexpected error. Please try again." },
      { status: 500 }
    );
  }
}
