import { NextResponse } from "next/server";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";
import type { DTClient } from "@/lib/drum-tracer/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { results, count } = paginate<DTClient>(dtStore.clients, searchParams, [
    "name",
    "contact_person",
    "email",
    "city",
    "country",
  ]);
  return NextResponse.json({ results, count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.contact_person || !body.email) {
    return NextResponse.json(
      { message: "name, contact_person and email are required" },
      { status: 400 },
    );
  }
  const client: DTClient = {
    id: nextId("clients"),
    name: body.name,
    contact_person: body.contact_person,
    email: body.email,
    phone: body.phone ?? "",
    address: body.address ?? "",
    city: body.city ?? "",
    postal_code: body.postal_code ?? "",
    state: body.state ?? "",
    country: body.country || "Netherlands",
    created_at: nowIso(),
  };
  dtStore.clients.unshift(client);
  return NextResponse.json(client, { status: 201 });
}
