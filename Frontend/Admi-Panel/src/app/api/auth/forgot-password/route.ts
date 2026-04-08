import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // This is a placeholder until the backend forgot-password endpoint is implemented.
    // For now, we return a success response to the frontend to maintain the security pattern
    // (don't reveal if an email exists or not).
    
    console.log(`Password reset requested for: ${email}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "If an account with that email exists, a reset link has been sent." 
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
