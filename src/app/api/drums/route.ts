import { NextResponse } from "next/server";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";
import type { DTDrum } from "@/lib/drum-tracer/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assignment = searchParams.get("assignment");
  let pool = dtStore.drums;
  if (assignment === "unassigned") pool = pool.filter((d) => !d.shipment_id);
  if (assignment === "assigned") pool = pool.filter((d) => !!d.shipment_id);

  const cleanParams = new URLSearchParams(searchParams);
  cleanParams.delete("assignment");
  const { results, count } = paginate<DTDrum>(pool, cleanParams, [
    "drum_number",
    "container_number",
  ]);
  return NextResponse.json({ results, count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.drum_number || !body.container_number) {
    return NextResponse.json(
      { message: "drum_number and container_number are required" },
      { status: 400 },
    );
  }
  const drum: DTDrum = {
    id: nextId("drums"),
    drum_number: String(body.drum_number),
    container_number: String(body.container_number),
    length_km: Number(body.length_km) || 0,
    net_weight_mt: Number(body.net_weight_mt) || 0,
    gross_weight_mt: Number(body.gross_weight_mt) || 0,
    status: "Available",
    shipment_id: null,
    notes: body.notes ?? "",
    last_updated: nowIso(),
  };
  dtStore.drums.unshift(drum);
  return NextResponse.json(drum, { status: 201 });
}
