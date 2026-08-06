import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const ids: number[] = body.ids ?? (body.id != null ? [body.id] : []);
  dtStore.orders = dtStore.orders.filter((o) => !ids.includes(o.id));
  dtStore.shipments.forEach((s) => {
    s.order_ids = s.order_ids.filter((oid) => !ids.includes(oid));
  });
  return NextResponse.json({ success: true, deleted: ids.length });
}
