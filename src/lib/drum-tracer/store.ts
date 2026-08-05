// In-memory data store for the Drum Tracer demo module.
// Mirrors the shape a real Django-style backend (results/count, numeric ids)
// would return, so it plugs straight into the existing useCRUDTable /
// CRUDTable / DetailsModal components unmodified.

export type OrderStatus = "Created" | "Assigned" | "Completed";
export type ShipmentStatus = "Created" | "In Transit" | "Arrived" | "Delivered";
export type DrumStatus = "Available" | "In Transit" | "Missing";
export type TruckStatus = "Scheduled" | "In Transit" | "Delivered" | "Overdue";

export interface DTClient {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  state?: string;
  country: string;
  created_at: string;
}

export interface DTSite {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code?: string;
  state?: string;
  country: string;
  contact_person?: string;
  contact_phone?: string;
  created_at: string;
}

export interface DTOrder {
  id: number;
  po_number: string;
  client_id: number;
  description?: string;
  status: OrderStatus;
  created_at: string;
}

export interface DTDrum {
  id: number;
  drum_number: string;
  container_number: string;
  length_km: number;
  net_weight_mt: number;
  gross_weight_mt: number;
  status: DrumStatus;
  shipment_id?: number | null;
  notes?: string;
  last_updated: string;
}

export interface DTShipment {
  id: number;
  shipment_number: string;
  invoice_number?: string;
  bl_number?: string;
  container_number?: string;
  destination_site_id: number;
  expected_arrival: string;
  status: ShipmentStatus;
  order_ids: number[];
  drum_ids: number[];
  created_at: string;
}

export interface DTTruckDelivery {
  id: number;
  shipment_id: number;
  truck_number: string;
  license_plate?: string;
  driver_name?: string;
  driver_phone?: string;
  scheduled_at: string;
  status: TruckStatus;
  notes?: string;
  created_at: string;
}

interface Store {
  nextId: Record<string, number>;
  clients: DTClient[];
  sites: DTSite[];
  orders: DTOrder[];
  drums: DTDrum[];
  shipments: DTShipment[];
  truckDeliveries: DTTruckDelivery[];
}

function seed(): Store {
  const now = new Date().toISOString();

  const client: DTClient = {
    id: 1,
    name: "TenneT TSO GMBH",
    contact_person: "Jacqueline",
    email: "jacqueline.schmidt@tennet.eu",
    phone: "+49921507404428",
    address: "Bernecker",
    city: "Bayreuth",
    postal_code: "1105 BG",
    state: "",
    country: "Germany",
    created_at: now,
  };

  const site: DTSite = {
    id: 1,
    name: "4500202348 Site",
    address: "Baulager Wi2Co, Weserstraße 22 - 32",
    city: "Weserstraße",
    postal_code: "26452 Sande",
    state: "",
    country: "Germany",
    contact_person: "Dennis Pieper",
    contact_phone: "0151 20355183",
    created_at: now,
  };

  const order: DTOrder = {
    id: 1,
    po_number: "4500101248",
    client_id: 1,
    description: "Supply of ACSR Conductor",
    status: "Assigned",
    created_at: now,
  };

  const containerSpecs: Record<string, { length: number; net: number; gross: number }> = {
    CMAU9605996: { length: 1.736, net: 3.76, gross: 4.26 },
    BMOU6976645: { length: 1.932, net: 4.15, gross: 4.65 },
    ECMU7124905: { length: 1.932, net: 4.19, gross: 4.69 },
  };
  const containers = Object.keys(containerSpecs);
  const drums: DTDrum[] = [];
  for (let i = 0; i < 13; i++) {
    const drumNumber = String(168 + i);
    const container = containers[Math.floor(i / 5)] ?? containers[containers.length - 1];
    const base = containerSpecs[container];
    drums.push({
      id: i + 1,
      drum_number: drumNumber,
      container_number: container,
      length_km: base.length,
      net_weight_mt: base.net,
      gross_weight_mt: base.gross,
      status: "Available",
      shipment_id: null,
      last_updated: now,
    });
  }

  const shipment: DTShipment = {
    id: 1,
    shipment_number: "SH2026001",
    invoice_number: "PMCL/2026/P/0466",
    bl_number: "BHA0122959",
    container_number: "",
    destination_site_id: 1,
    expected_arrival: "2026-08-19",
    status: "In Transit",
    order_ids: [1],
    drum_ids: [],
    created_at: now,
  };

  return {
    nextId: { clients: 2, sites: 2, orders: 2, drums: drums.length + 1, shipments: 2, truckDeliveries: 1 },
    clients: [client],
    sites: [site],
    orders: [order],
    drums,
    shipments: [shipment],
    truckDeliveries: [],
  };
}

const globalForStore = globalThis as unknown as { __dtStore?: Store };
export const dtStore: Store = globalForStore.__dtStore ?? seed();
if (process.env.NODE_ENV !== "production") {
  globalForStore.__dtStore = dtStore;
}

export function nextId(kind: keyof Store["nextId"]) {
  const id = dtStore.nextId[kind];
  dtStore.nextId[kind] = id + 1;
  return id;
}

export function nowIso() {
  return new Date().toISOString();
}

/** Paginate + search + sort an array like a Django REST list endpoint would. */
export function paginate<T extends object>(
  items: T[],
  params: URLSearchParams,
  searchableFields: (keyof T)[],
) {
  let results = [...items];

  const search = params.get("search");
  if (search) {
    const q = search.toLowerCase();
    results = results.filter((item) =>
      searchableFields.some((field) => String(item[field] ?? "").toLowerCase().includes(q)),
    );
  }

  for (const [key, value] of params.entries()) {
    if (["page", "page_size", "search", "ordering"].includes(key) || !value) continue;
    results = results.filter((item) => String((item as Record<string, unknown>)[key]) === value);
  }

  const ordering = params.get("ordering");
  if (ordering) {
    const desc = ordering.startsWith("-");
    const field = (desc ? ordering.slice(1) : ordering) as keyof T;
    results.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      const cmp = av! > bv! ? 1 : -1;
      return desc ? -cmp : cmp;
    });
  }

  const count = results.length;
  const page = Number(params.get("page") || 1);
  const pageSize = Number(params.get("page_size") || 10);
  const start = (page - 1) * pageSize;
  results = results.slice(start, start + pageSize);

  return { results, count };
}
