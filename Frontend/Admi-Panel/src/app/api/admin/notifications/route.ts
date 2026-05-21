export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

const ALLOWED_NOTIFICATION_TYPES = new Set(["send", "broadcast", "sms", "email"]);

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value || "";

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const url = new URL(request.url);
  const rawType = url.searchParams.get("type") || "send";

  if (!ALLOWED_NOTIFICATION_TYPES.has(rawType)) {
    return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
  }

  const type = rawType;
  let endpoint: string;
  if (type === "broadcast") {
    endpoint = `${API_BASE}/notifications/broadcast`;
  } else if (type === "sms") {
    endpoint = `${API_BASE}/notifications/sms/send`;
  } else if (type === "email") {
    endpoint = `${API_BASE}/notifications/email/test`;
  } else {
    endpoint = `${API_BASE}/notifications/send`;
  }
  
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    
    // If the backend returns an error (4xx or 5xx), we pass it through clearly
    if (!res.ok) {
      let errorMessage = "Backend Error";
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorData || text;
      } catch (e) {
        errorMessage = text || `Error ${res.status}`;
      }
      return NextResponse.json({ message: errorMessage }, { status: res.status });
    }
    
    try {
      return NextResponse.json(JSON.parse(text));
    } catch (e) {
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ message: `Connection Error: ${error.message}` }, { status: 500 });
  }
}
