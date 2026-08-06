import { NextResponse } from "next/server";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";
import type { DTOrder } from "@/lib/drum-tracer/store";

function withClientName(o: DTOrder) {
  return {
    ...o,
    client_name: dtStore.clients.find((c) => c.id === o.client_id)?.name ?? "Unknown",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assignment = searchParams.get("assignment");
  let pool = dtStore.orders;
  if (assignment === "unassigned") {
    const assignedIds = new Set(dtStore.shipments.flatMap((s) => s.order_ids));
    pool = pool.filter((o) => !assignedIds.has(o.id));
  }

  const cleanParams = new URLSearchParams(searchParams);
  cleanParams.delete("assignment");
  const { results, count } = paginate<DTOrder>(pool, cleanParams, ["po_number"]);
  return NextResponse.json({ results: results.map(withClientName), count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.po_number || !body.client_id) {
    return NextResponse.json({ message: "po_number and client_id are required" }, { status: 400 });
  }
  if (!dtStore.clients.some((c) => c.id === Number(body.client_id))) {
    return NextResponse.json({ message: "Unknown client_id" }, { status: 400 });
  }
  const order: DTOrder = {
    id: nextId("orders"),
    po_number: body.po_number,
    client_id: Number(body.client_id),
    description: body.description ?? "",
    status: "Created",
    created_at: nowIso(),
  };
  dtStore.orders.unshift(order);
  return NextResponse.json(withClientName(order), { status: 201 });
}
