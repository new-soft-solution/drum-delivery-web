// src/app/api/shipments/[id]/drums/route.ts
import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

// This route only manages the local link between a (mock) Shipment and
// real Drum UUIDs — it does not know anything about the drums themselves
// anymore (no local drum data to validate/enrich against). The client
// fetches each linked drum's real details directly from the real backend
// via src/services/drum.service.ts.

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shipment = dtStore.shipments.find((s) => s.id === Number(id));
  if (!shipment)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({
    results: shipment.drum_ids,
    count: shipment.drum_ids.length,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shipment = dtStore.shipments.find((s) => s.id === Number(id));
  if (!shipment)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();
  const drumIds: string[] = Array.isArray(body.drum_ids) ? body.drum_ids : [];
  shipment.drum_ids = Array.from(new Set([...shipment.drum_ids, ...drumIds]));

  return NextResponse.json({ success: true, assigned: drumIds.length });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shipment = dtStore.shipments.find((s) => s.id === Number(id));
  if (!shipment)
    return NextResponse.json({ message: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const drumId = searchParams.get("drumId");

  shipment.drum_ids = shipment.drum_ids.filter((did) => did !== drumId);

  return NextResponse.json({ success: true });
}
