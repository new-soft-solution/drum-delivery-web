// src/app/api/shipments/route.ts
import { NextResponse } from "next/server";
import type { DTShipment } from "@/lib/drum-tracer/store";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";

let counter = 1;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { results, count } = paginate<DTShipment>(
    dtStore.shipments,
    searchParams,
    ["shipment_number", "invoice_number", "bl_number"],
  );
  return NextResponse.json({ results, count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.destination_site_id || !body.expected_arrival) {
    return NextResponse.json(
      { message: "destination_site_id and expected_arrival are required" },
      { status: 400 },
    );
  }
  // NOTE: destination_site_id is no longer validated against a local table
  // — Sites are real backend records now (see src/services/site.service.ts)
  // that this server route has no way to check without the user's access
  // token. Whatever UUID the client sends is trusted as-is; the client
  // resolves it to a real site name via <SiteName /> when displaying it.
  const year = new Date().getFullYear();
  counter = Math.max(counter, dtStore.shipments.length + 1);
  const auto = `SH${year}${String(counter++).padStart(3, "0")}`;

  const shipment: DTShipment = {
    id: nextId("shipments"),
    shipment_number: body.shipment_number?.trim() || auto,
    invoice_number: body.invoice_number ?? "",
    bl_number: body.bl_number ?? "",
    container_number: body.container_number ?? "",
    destination_site_id: String(body.destination_site_id),
    expected_arrival: body.expected_arrival,
    status: "Created",
    order_ids: [],
    drum_ids: [],
    created_at: nowIso(),
  };
  dtStore.shipments.unshift(shipment);
  return NextResponse.json(shipment, { status: 201 });
}
