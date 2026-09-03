import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const ids: number[] = body.ids ?? (body.id != null ? [body.id] : []);
  dtStore.truckDeliveries = dtStore.truckDeliveries.filter((t) => !ids.includes(t.id));
  return NextResponse.json({ success: true, deleted: ids.length });
}
