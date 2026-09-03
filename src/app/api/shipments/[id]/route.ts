// src/app/api/shipments/[id]/route.ts
import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

function enrich(id: number) {
  const shipment = dtStore.shipments.find((s) => s.id === id);
  if (!shipment) return null;
  return {
    ...shipment,
    destination_site_name:
      dtStore.sites.find((s) => s.id === shipment.destination_site_id)?.name ??
      "Unknown",
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shipment = enrich(Number(id));
  if (!shipment)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(shipment);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const idx = dtStore.shipments.findIndex((s) => s.id === Number(id));
  if (idx === -1)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await request.json();
  dtStore.shipments[idx] = {
    ...dtStore.shipments[idx],
    ...body,
    id: Number(id),
  };

  // Drums used to be a local mock table this route could reach into and
  // update in lockstep with the shipment's status. They're real backend
  // records now (see src/services/drum.service.ts) that only the browser
  // (with the user's access token) can update — this server route has no
  // way to do that server-side, so that side effect was removed rather
  // than silently doing nothing useful.

  return NextResponse.json(dtStore.shipments[idx]);
}
