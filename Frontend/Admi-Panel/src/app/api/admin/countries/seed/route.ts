import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function POST() {
  const token = (await cookies()).get("admin_token")?.value || "";
  try {
    const res = await fetch(`${API_BASE}/countries/seed`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to seed countries" }, { status: 500 });
  }
}
