import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, isProd } from "@/lib/bff-utils";

/**
 * BFF proxy for Cloudinary upload signatures.
 * Reads the httpOnly kryros_token cookie and forwards the request to
 * the NestJS backend with proper Authorization header.
 * 
 * This avoids the raw fetch() bypassing the Axios 401 interceptor.
 * 
 * GET /api/bff/cloudinary-sign?folder=kryros/videos
 */
export async function GET(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get("folder") || "kryros/videos";

  // Read the httpOnly token cookie (set by /api/bff/login)
  const tokenCookie =
    req.cookies.get("kryros_token")?.value ||
    req.cookies.get("kryros_admin_token")?.value;

  if (!tokenCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendUrl = getBackendUrl();
    const upstream = await fetch(
      `${backendUrl}/api/cloudinary/sign?folder=${encodeURIComponent(folder)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenCookie}`,
        },
      }
    );

    if (!upstream.ok) {
      const errBody = await upstream.text();
      return NextResponse.json(
        { message: "Backend sign failed", detail: errBody },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: "Backend unavailable" },
      { status: 503 }
    );
  }
}
