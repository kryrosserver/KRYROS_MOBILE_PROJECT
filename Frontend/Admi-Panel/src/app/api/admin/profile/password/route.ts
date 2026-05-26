export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function PUT(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!body.currentPassword || !body.newPassword) {
    return NextResponse.json(
      { error: "Current password and new password are required." },
      { status: 400 }
    );
  }

  // Step 1: Get current user identity from /auth/me
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return NextResponse.json(
      { error: "Unable to verify session. Please log in again." },
      { status: 401 }
    );
  }

  const meData = (await meRes.json()) as {
    id?: string;
    email?: string | null;
    phone?: string | null;
  };
  const userId = meData.id;
  const identifier = meData.email || meData.phone;

  if (!userId || !identifier) {
    return NextResponse.json(
      { error: "Unable to identify user." },
      { status: 400 }
    );
  }

  // Step 2: Verify current password by attempting login
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password: body.currentPassword }),
    cache: "no-store",
  });

  if (!loginRes.ok) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 401 }
    );
  }

  // Step 3: Update password via PUT /users/:id
  const updateRes = await fetch(`${API_BASE}/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: body.newPassword }),
    cache: "no-store",
  });

  if (!updateRes.ok) {
    const text = await updateRes.text().catch(() => "Failed to update password");
    return NextResponse.json({ error: text }, { status: updateRes.status });
  }

  return NextResponse.json({ success: true, message: "Password updated successfully." });
}
