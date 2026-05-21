import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "If an account with that email exists, a reset link has been sent.",
  });
}
