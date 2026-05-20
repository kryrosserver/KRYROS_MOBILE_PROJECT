import { NextRequest, NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";

function getAdminToken(req: NextRequest): string {
  const token = req.cookies.get("admin_token")?.value;
  return token || "";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAdminToken(req);
    const body = await req.json();
    const res = await fetch(`${API_BASE}/countries/${params.id}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update country" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAdminToken(req);
    const res = await fetch(`${API_BASE}/countries/${params.id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete country" }, { status: 500 });
  }
}
