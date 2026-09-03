import { NextResponse } from "next/server";
import { dtStore, nextId, nowIso, paginate } from "@/lib/drum-tracer/store";
import type { DTSite } from "@/lib/drum-tracer/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { results, count } = paginate<DTSite>(dtStore.sites, searchParams, [
    "name",
    "address",
    "city",
    "country",
  ]);
  return NextResponse.json({ results, count });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.address || !body.city || !body.country) {
    return NextResponse.json(
      { message: "name, address, city and country are required" },
      { status: 400 },
    );
  }
  const site: DTSite = {
    id: nextId("sites"),
    name: body.name,
    address: body.address,
    city: body.city,
    postal_code: body.postal_code ?? "",
    state: body.state ?? "",
    country: body.country,
    contact_person: body.contact_person ?? "",
    contact_phone: body.contact_phone ?? "",
    created_at: nowIso(),
  };
  dtStore.sites.unshift(site);
  return NextResponse.json(site, { status: 201 });
}
