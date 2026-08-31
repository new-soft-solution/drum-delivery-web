import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

// This route only manages the local link between a (mock) Shipment and
// real Order UUIDs — it does not know anything about the orders
// themselves anymore (no local order data to validate/enrich against).
// The client fetches each linked order's real details directly from the
// real backend via src/services/order.service.ts.

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = dtStore.shipments.find((s) => s.id === Number(id));
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ results: shipment.order_ids, count: shipment.order_ids.length });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = dtStore.shipments.find((s) => s.id === Number(id));
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();
  const orderIds: string[] = Array.isArray(body.order_ids) ? body.order_ids : [];
  shipment.order_ids = Array.from(new Set([...shipment.order_ids, ...orderIds]));

  return NextResponse.json({ success: true, assigned: orderIds.length });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipment = dtStore.shipments.find((s) => s.id === Number(id));
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  shipment.order_ids = shipment.order_ids.filter((oid) => oid !== orderId);

  return NextResponse.json({ success: true });
}
