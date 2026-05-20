import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  const res = await fetch(`${API_BASE}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to load users" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}

export async function POST(req: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const body = await req.json();
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    return NextResponse.json({ error: text || "Failed to create user" }, { status: res.status });
  }
  return NextResponse.json(JSON.parse(text));
}

export async function DELETE(req: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to delete user" }, { status: res.status });
  }
  return NextResponse.json({ success: true });
}
