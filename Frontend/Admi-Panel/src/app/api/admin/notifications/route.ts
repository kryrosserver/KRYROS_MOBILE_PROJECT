export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function POST(request: Request) {
  // Synchronous cookies() for Next.js 14.1.0
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value || "";
  const body = await request.json();
  
  // Determine if it's a broadcast, targeted send, or SMS
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "send"; 
  
  // Map our bridge types to the actual backend endpoints
  let endpoint = `${API_BASE}/notifications/${type}`;
  if (type === "sms") {
    endpoint = `${API_BASE}/notifications/sms/send`;
  } else if (type === "email") {
    endpoint = `${API_BASE}/notifications/email/test`;
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
    console.error("Bridge Error:", error);
    return NextResponse.json({ message: `Connection Error: ${error.message}` }, { status: 500 });
  }
}
