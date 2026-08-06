import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

function withClientName(orderId: number) {
  const order = dtStore.orders.find((o) => o.id === orderId);
  if (!order) return null;
  return {
    ...order,
    client_name: dtStore.clients.find((c) => c.id === order.client_id)?.name ?? "Unknown",
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipmentId = Number(id);
  const shipment = dtStore.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });
  const results = shipment.order_ids.map(withClientName).filter(Boolean);
  return NextResponse.json({ results, count: results.length });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipmentId = Number(id);
  const shipment = dtStore.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await request.json();
  const orderIds: number[] = Array.isArray(body.order_ids) ? body.order_ids : [];

  shipment.order_ids = Array.from(new Set([...shipment.order_ids, ...orderIds]));
  orderIds.forEach((orderId) => {
    const order = dtStore.orders.find((o) => o.id === orderId);
    if (order) order.status = "Assigned";
  });

  return NextResponse.json({ success: true, assigned: orderIds.length });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const shipmentId = Number(id);
  const shipment = dtStore.shipments.find((s) => s.id === shipmentId);
  if (!shipment) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const orderId = Number(searchParams.get("orderId"));

  shipment.order_ids = shipment.order_ids.filter((oid) => oid !== orderId);

  return NextResponse.json({ success: true });
}
