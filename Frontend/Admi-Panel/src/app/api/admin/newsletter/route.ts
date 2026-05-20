import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function GET(request: Request) {
  const token = cookies().get("admin_token")?.value || "";
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "list"; 
  
  const res = await fetch(`${API_BASE}/newsletter/${type}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ message: data.message || "Failed to fetch newsletter data" }, { status: res.status });
  }
  
  return NextResponse.json(data);
}
