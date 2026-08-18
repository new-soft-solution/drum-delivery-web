import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
  }

  const profile = dtStore.profile;
  const matchesUsername = username === profile.username || username === profile.email;

  if (!matchesUsername || password !== profile.password) {
    return NextResponse.json({ message: "Incorrect username or password" }, { status: 401 });
  }

  const safeProfile = {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    username: profile.username,
  };
  return NextResponse.json({ success: true, user: safeProfile });
}
