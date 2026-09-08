import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function GET() {
  return NextResponse.json({
    truckDeliveries: {
      total: dtStore.truckDeliveries.length,
      scheduled: dtStore.truckDeliveries.filter((t) => t.status === "Scheduled")
        .length,
    },
  });
}
