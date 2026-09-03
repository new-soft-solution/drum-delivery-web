import { NextResponse } from "next/server";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";
import type { DTShipment } from "@/lib/drum-tracer/store";

function withDestination(s: DTShipment) {
  return {
    ...s,
    destination_site_name: dtStore.sites.find((site) => site.id === s.destination_site_id)?.name ?? "Unknown",
  };
}

let counter = 1;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { results, count } = paginate<DTShipment>(dtStore.shipments, searchParams, [
    "shipment_number",
    "invoice_number",
    "bl_number",
  ]);
  return NextResponse.json({ results: results.map(withDestination), count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.destination_site_id || !body.expected_arrival) {
    return NextResponse.json(
      { message: "destination_site_id and expected_arrival are required" },
      { status: 400 },
    );
  }
  if (!dtStore.sites.some((s) => s.id === Number(body.destination_site_id))) {
    return NextResponse.json({ message: "Unknown destination_site_id" }, { status: 400 });
  }
  const year = new Date().getFullYear();
  counter = Math.max(counter, dtStore.shipments.length + 1);
  const auto = `SH${year}${String(counter++).padStart(3, "0")}`;

  const shipment: DTShipment = {
    id: nextId("shipments"),
    shipment_number: body.shipment_number?.trim() || auto,
    invoice_number: body.invoice_number ?? "",
    bl_number: body.bl_number ?? "",
    container_number: body.container_number ?? "",
    destination_site_id: Number(body.destination_site_id),
    expected_arrival: body.expected_arrival,
    status: "Created",
    order_ids: [],
    drum_ids: [],
    created_at: nowIso(),
  };
  dtStore.shipments.unshift(shipment);
  return NextResponse.json(withDestination(shipment), { status: 201 });
}
