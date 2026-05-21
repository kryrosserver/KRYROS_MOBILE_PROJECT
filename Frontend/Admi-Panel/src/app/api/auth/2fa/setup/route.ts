import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { parseBackendError } from "@/lib/api";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const message = await parseBackendError(res);
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, ...data });
  } catch {
    return NextResponse.json({ success: false, error: "Unexpected error" }, { status: 500 });
  }
}
