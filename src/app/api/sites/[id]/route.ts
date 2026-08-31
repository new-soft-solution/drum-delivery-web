import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = dtStore.sites.findIndex((s) => s.id === Number(id));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await request.json();
  dtStore.sites[idx] = { ...dtStore.sites[idx], ...body, id: Number(id) };
  return NextResponse.json(dtStore.sites[idx]);
}
