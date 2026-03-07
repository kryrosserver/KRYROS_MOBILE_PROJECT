import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: text || "Login failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const response = NextResponse.json({ success: true, user: data.user });
    const token = data.accessToken;
    const role = data.user?.role || "CUSTOMER";
    // Set httpOnly token cookie and a small role cookie for role gating
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    response.cookies.set("admin_role", role, {
      httpOnly: false,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
