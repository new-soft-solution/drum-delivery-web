import { NextResponse } from "next/server";
import type { DTTruckDelivery } from "@/lib/drum-tracer/store";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { results, count } = paginate<DTTruckDelivery>(
    dtStore.truckDeliveries,
    searchParams,
    ["truck_number", "driver_name"],
  );
  return NextResponse.json({ results, count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.shipment_id || !body.truck_number || !body.scheduled_at) {
    return NextResponse.json(
      { message: "shipment_id, truck_number and scheduled_at are required" },
      { status: 400 },
    );
  }
  // NOTE: shipment_id is no longer validated against a local table —
  // Shipments are real backend records now (see
  // src/services/shipment.service.ts) that this server route has no way
  // to check without the user's access token. Whatever UUID the client
  // sends is trusted as-is; the client resolves it to a real shipment
  // number via <ShipmentNumber /> when displaying it.
  const delivery: DTTruckDelivery = {
    id: nextId("truckDeliveries"),
    shipment_id: String(body.shipment_id),
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
  return NextResponse.json(delivery, { status: 201 });
}
