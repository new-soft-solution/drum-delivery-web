import { NextResponse } from "next/server";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";
import type { DTTruckDelivery } from "@/lib/drum-tracer/store";

function withShipment(t: DTTruckDelivery) {
  return {
    ...t,
    shipment_number: dtStore.shipments.find((s) => s.id === t.shipment_id)?.shipment_number ?? "Unknown",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { results, count } = paginate<DTTruckDelivery>(dtStore.truckDeliveries, searchParams, [
    "truck_number",
    "driver_name",
  ]);
  return NextResponse.json({ results: results.map(withShipment), count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.shipment_id || !body.truck_number || !body.scheduled_at) {
    return NextResponse.json(
      { message: "shipment_id, truck_number and scheduled_at are required" },
      { status: 400 },
    );
  }
  if (!dtStore.shipments.some((s) => s.id === Number(body.shipment_id))) {
    return NextResponse.json({ message: "Unknown shipment_id" }, { status: 400 });
  }
  const delivery: DTTruckDelivery = {
    id: nextId("truckDeliveries"),
    shipment_id: Number(body.shipment_id),
    truck_number: body.truck_number,
    license_plate: body.license_plate ?? "",
    driver_name: body.driver_name ?? "",
    driver_phone: body.driver_phone ?? "",
    scheduled_at: body.scheduled_at,
    status: "Scheduled",
    notes: body.notes ?? "",
    created_at: nowIso(),
  };
  dtStore.truckDeliveries.unshift(delivery);
  return NextResponse.json(withShipment(delivery), { status: 201 });
}
