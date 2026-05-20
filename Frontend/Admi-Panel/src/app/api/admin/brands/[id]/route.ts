import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

function getAdminToken(req: NextRequest): string {
  const token = req.cookies.get("admin_token")?.value;
  return token || "";
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getAdminToken(req);
  const { id } = params;
  
  const res = await fetch(`${API_BASE}/brands/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });
  
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getAdminToken(req);
  const body = await req.json();
  const { id } = params;
  
  const res = await fetch(`${API_BASE}/brands/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getAdminToken(req);
  const { id } = params;
  
  const res = await fetch(`${API_BASE}/brands/${id}`, {
    method: "DELETE",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  
  if (!res.ok) {
    const error = await res.text();
    return NextResponse.json({ error }, { status: res.status });
  }
  
  return NextResponse.json({ success: true });
}
