export type TruckStatus = "Scheduled" | "In Transit" | "Delivered" | "Overdue";

export interface DTTruckDelivery {
  id: number;
  shipment_id: string; // real Shipment UUID from the live backend
  shipment_number?: string;
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
  truckDeliveries: DTTruckDelivery[];
}

function seed(): Store {
  return {
    nextId: { truckDeliveries: 1 },
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
