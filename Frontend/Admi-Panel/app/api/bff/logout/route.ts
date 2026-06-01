import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = (process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-rwb2.onrender.com")
  .replace(/\/api$/, "");

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("kryros_refresh")?.value;

  // Best-effort server-side revocation — fire and forget
  if (refreshToken) {
    fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  const res = NextResponse.json({ success: true });
  // Expire all auth cookies
  res.cookies.set("kryros_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("kryros_refresh", "", { maxAge: 0, path: "/" });
  res.cookies.set("kryros_admin_token", "", { maxAge: 0, path: "/" });
  return res;
}
