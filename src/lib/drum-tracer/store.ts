// src/lib/drum-tracer/store.ts
// In-memory data store for the Drum Tracer demo module.
// Mirrors the shape a real Django-style backend (results/count, numeric ids)
// would return, so it plugs straight into the existing useCRUDTable /
// CRUDTable / DetailsModal components unmodified.
//
// Clients, Orders, Drums, and Sites used to live here too, but now come
// from the real backend (drum-delivery-api.onrender.com) via
// src/services/client.service.ts, order.service.ts, drum.service.ts, and
// site.service.ts — see README.md. Shipments and Truck Deliveries have no
// real backend endpoint yet, so they stay here. A Shipment's `order_ids`,
// `drum_ids`, and `destination_site_id` now hold real UUIDs (strings)
// rather than referencing anything in this file.

export type ShipmentStatus = "Created" | "In Transit" | "Arrived" | "Delivered";
export type TruckStatus = "Scheduled" | "In Transit" | "Delivered" | "Overdue";

export interface DTShipment {
  id: number;
  shipment_number: string;
  invoice_number?: string;
  bl_number?: string;
  container_number?: string;
  destination_site_id: string; // real Site UUID from the live backend
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
  shipments: DTShipment[];
  truckDeliveries: DTTruckDelivery[];
}

function seed(): Store {
  const now = new Date().toISOString();

  const shipment: DTShipment = {
    id: 1,
    shipment_number: "SH2026001",
    invoice_number: "PMCL/2026/P/0466",
    bl_number: "BHA0122959",
    container_number: "",
    destination_site_id: "", // no real site UUID known ahead of time — set one via editing the shipment
    expected_arrival: "2026-08-19",
    status: "In Transit",
    order_ids: [], // no real order UUIDs known ahead of time — link one via "Assign Orders"
    drum_ids: [], // same — link real drums via "Assign Drums"
    created_at: now,
  };

  return {
    nextId: { shipments: 2, truckDeliveries: 1 },
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
