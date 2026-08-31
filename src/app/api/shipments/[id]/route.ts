import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

function enrich(id: number) {
  const shipment = dtStore.shipments.find((s) => s.id === id);
  if (!shipment) return null;
  return {
    ...shipment,
    destination_site_name: dtStore.sites.find((s) => s.id === shipment.destination_site_id)?.name ?? "Unknown",
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = enrich(Number(id));
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(shipment);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idx = dtStore.shipments.findIndex((s) => s.id === Number(id));
  if (idx === -1) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const body = await request.json();
  dtStore.shipments[idx] = { ...dtStore.shipments[idx], ...body, id: Number(id) };

  if (body.status) {
    const assignedDrums = dtStore.drums.filter((d) => d.shipment_id === Number(id));
    assignedDrums.forEach((d) => {
      if (body.status === "In Transit" || body.status === "Arrived") d.status = "In Transit";
      if (body.status === "Delivered") d.status = "Available";
    });
  }

  return NextResponse.json(dtStore.shipments[idx]);
}
