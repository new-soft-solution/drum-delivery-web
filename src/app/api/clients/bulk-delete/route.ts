import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const ids: number[] = body.ids ?? (body.id != null ? [body.id] : []);
  dtStore.clients = dtStore.clients.filter((c) => !ids.includes(c.id));
  return NextResponse.json({ success: true, deleted: ids.length });
}
