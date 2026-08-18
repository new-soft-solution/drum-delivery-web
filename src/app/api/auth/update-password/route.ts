import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { message: "Current and new password are required" },
      { status: 400 },
    );
  }
  if (currentPassword !== dtStore.profile.password) {
    return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
  }
  if (String(newPassword).length < 6) {
    return NextResponse.json({ message: "New password must be at least 6 characters" }, { status: 400 });
  }

  dtStore.profile.password = newPassword;
  return NextResponse.json({ success: true, message: "Password updated." });
}
