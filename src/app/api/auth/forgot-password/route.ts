import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  // Demo only: no real email is sent. Always responds success so we never
  // leak whether an address exists in the system.
  return NextResponse.json({
    success: true,
    message: "If an account exists for that email, a reset link has been sent.",
  });
}
