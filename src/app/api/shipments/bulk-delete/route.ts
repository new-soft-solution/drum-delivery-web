// src/app/api/shipments/bulk-delete/route.ts
import { NextResponse } from "next/server";
import { dtStore } from "@/lib/drum-tracer/store";

export async function POST(request: Request) {
  const body = await request.json();
  const ids: number[] = body.ids ?? (body.id != null ? [body.id] : []);
  dtStore.shipments = dtStore.shipments.filter((s) => !ids.includes(s.id));
  // No local drum table to clean up anymore — Drums are real backend
  // records now (see src/services/drum.service.ts).
  return NextResponse.json({ success: true, deleted: ids.length });
}
