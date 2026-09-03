// src/lib/drum-tracer/store.ts
// In-memory data store for the Drum Tracer demo module.
// Mirrors the shape a real Django-style backend (results/count, numeric ids)
// would return, so it plugs straight into the existing useCRUDTable /
// CRUDTable / DetailsModal components unmodified.
//
// Clients, Orders, and Drums used to live here too, but now come from the
// real backend (drum-delivery-api.onrender.com) via
// src/services/client.service.ts, order.service.ts, and drum.service.ts —
// see README.md. Shipments, Sites, and Truck Deliveries have no real
// backend endpoint yet, so they stay here. A Shipment's `order_ids` and
// `drum_ids` now hold real UUIDs (strings) rather than referencing
// anything in this file.

export type ShipmentStatus = "Created" | "In Transit" | "Arrived" | "Delivered";
export type TruckStatus = "Scheduled" | "In Transit" | "Delivered" | "Overdue";

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

export interface DTShipment {
  id: number;
  shipment_number: string;
  invoice_number?: string;
  bl_number?: string;
  container_number?: string;
  destination_site_id: number;
  expected_arrival: string;
  status: ShipmentStatus;
  order_ids: string[]; // real Order UUIDs from the live backend
  drum_ids: string[]; // real Drum UUIDs from the live backend
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
  sites: DTSite[];
  shipments: DTShipment[];
  truckDeliveries: DTTruckDelivery[];
}

function seed(): Store {
  const now = new Date().toISOString();

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

  const shipment: DTShipment = {
    id: 1,
    shipment_number: "SH2026001",
    invoice_number: "PMCL/2026/P/0466",
    bl_number: "BHA0122959",
    container_number: "",
    destination_site_id: 1,
    expected_arrival: "2026-08-19",
    status: "In Transit",
    order_ids: [], // no real order UUIDs known ahead of time — link one via "Assign Orders"
    drum_ids: [], // same — link real drums via "Assign Drums"
    created_at: now,
  };

  return {
    nextId: { sites: 2, shipments: 2, truckDeliveries: 1 },
    sites: [site],
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
      searchableFields.some((field) =>
        String(item[field] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  for (const [key, value] of params.entries()) {
    if (["page", "page_size", "search", "ordering"].includes(key) || !value)
      continue;
    results = results.filter(
      (item) => String((item as Record<string, unknown>)[key]) === value,
    );
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
