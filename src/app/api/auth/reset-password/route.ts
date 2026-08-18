import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const { password } = body;

  if (!password || String(password).length < 6) {
    return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
  }

  // Demo only: the reset token isn't actually verified against anything.
  dtStore.profile.password = password;

  return NextResponse.json({ success: true, message: "Password has been reset." });
}
