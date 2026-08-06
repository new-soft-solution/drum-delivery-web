import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = dtStore.clients.findIndex((c) => c.id === Number(id));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await request.json();
  dtStore.clients[idx] = { ...dtStore.clients[idx], ...body, id: Number(id) };
  return NextResponse.json(dtStore.clients[idx]);
}
