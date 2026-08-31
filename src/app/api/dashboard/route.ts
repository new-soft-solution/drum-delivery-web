import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

// Only covers the still-local/mock entities (Shipments, Drums, Sites,
// Truck Deliveries). Client and Order stats are fetched client-side
// directly from the real backend in the Dashboard page component itself
// (via src/services/client.service.ts / order.service.ts), since this
// server route has no access to the user's browser-held access token.
export async function GET() {
  const shipments = dtStore.shipments;

  const shipmentsByStatus = {
    created: shipments.filter((s) => s.status === "Created").length,
    inTransit: shipments.filter((s) => s.status === "In Transit").length,
    delivered: shipments.filter((s) => s.status === "Delivered").length,
  };

  const recentShipments = [...shipments]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)
    .map((s) => ({
      ...s,
      destination_site_name: dtStore.sites.find((site) => site.id === s.destination_site_id)?.name ?? "Unknown",
    }));

  return NextResponse.json({
    shipments: { total: shipments.length, ...shipmentsByStatus },
    drums: {
      total: dtStore.drums.length,
      available: dtStore.drums.filter((d) => d.status === "Available").length,
      inTransit: dtStore.drums.filter((d) => d.status === "In Transit").length,
      missing: dtStore.drums.filter((d) => d.status === "Missing").length,
    },
    truckDeliveries: {
      total: dtStore.truckDeliveries.length,
      scheduled: dtStore.truckDeliveries.filter((t) => t.status === "Scheduled").length,
    },
    sites: dtStore.sites.length,
    recentShipments,
  });
}
