import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function GET() {
  const orders = dtStore.orders;
  const shipments = dtStore.shipments;

  const ordersByStatus = {
    created: orders.filter((o) => o.status === "Created").length,
    assigned: orders.filter((o) => o.status === "Assigned").length,
    completed: orders.filter((o) => o.status === "Completed").length,
  };
  const shipmentsByStatus = {
    created: shipments.filter((s) => s.status === "Created").length,
    inTransit: shipments.filter((s) => s.status === "In Transit").length,
    delivered: shipments.filter((s) => s.status === "Delivered").length,
  };

  const recentOrders = [...orders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)
    .map((o) => ({
      ...o,
      client_name: dtStore.clients.find((c) => c.id === o.client_id)?.name ?? "Unknown",
    }));

  const recentShipments = [...shipments]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)
    .map((s) => ({
      ...s,
      destination_site_name: dtStore.sites.find((site) => site.id === s.destination_site_id)?.name ?? "Unknown",
    }));

  return NextResponse.json({
    orders: { total: orders.length, ...ordersByStatus },
    shipments: { total: shipments.length, ...shipmentsByStatus },
    drums: { total: dtStore.drums.length, available: dtStore.drums.filter((d) => d.status === "Available").length },
    recentOrders,
    recentShipments,
  });
}
