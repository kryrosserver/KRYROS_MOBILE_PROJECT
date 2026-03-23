import { NextResponse } from "next/server";

const BACKEND_URL = "https://kryrosbackend-d68q.onrender.com/api";

export async function POST() {
  try {
    const res = await fetch(`${BACKEND_URL}/countries/refresh-rates`, {
      method: "POST",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: "Failed to refresh exchange rates" }, { status: 500 });
  }
}
