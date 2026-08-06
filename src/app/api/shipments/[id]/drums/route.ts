import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipmentId = Number(id);
  const drums = dtStore.drums.filter((d) => d.shipment_id === shipmentId);
  return NextResponse.json({ results: drums, count: drums.length });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipmentId = Number(id);
  const shipment = dtStore.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();
  const drumIds: number[] = Array.isArray(body.drum_ids) ? body.drum_ids : [];

  shipment.drum_ids = Array.from(new Set([...shipment.drum_ids, ...drumIds]));
  drumIds.forEach((drumId) => {
    const drum = dtStore.drums.find((d) => d.id === drumId);
    if (drum) drum.shipment_id = shipmentId;
  });

  return NextResponse.json({ success: true, assigned: drumIds.length });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipmentId = Number(id);
  const shipment = dtStore.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const drumId = Number(searchParams.get("drumId"));

  shipment.drum_ids = shipment.drum_ids.filter((did) => did !== drumId);
  const drum = dtStore.drums.find((d) => d.id === drumId);
  if (drum) drum.shipment_id = null;

  return NextResponse.json({ success: true });
}
