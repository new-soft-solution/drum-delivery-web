import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const ids: number[] = body.ids ?? (body.id != null ? [body.id] : []);
  dtStore.shipments = dtStore.shipments.filter((s) => !ids.includes(s.id));
  dtStore.drums.forEach((d) => {
    if (d.shipment_id && ids.includes(d.shipment_id)) d.shipment_id = null;
  });
  return NextResponse.json({ success: true, deleted: ids.length });
}
