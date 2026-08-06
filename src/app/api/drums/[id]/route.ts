import { NextResponse } from "next/server";
import { dtStore, nowIso } from "@/lib/drum-tracer/store";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = dtStore.drums.findIndex((d) => d.id === Number(id));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await request.json();
  dtStore.drums[idx] = { ...dtStore.drums[idx], ...body, id: Number(id), last_updated: nowIso() };
  return NextResponse.json(dtStore.drums[idx]);
}
