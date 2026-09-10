"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Avatar from "@/components/ui/Avatar/Avatar";
import { getClients } from "@/services/client.service";
import { getOrders } from "@/services/order.service";
import { getDrums } from "@/services/drum.service";
import { getShipments } from "@/services/shipment.service";
import { getTruckDeliveries } from "@/services/truck-delivery.service";
import { SHIPMENT_STATUS_LABELS } from "@/types/shipment.type";
import { SiteName } from "@/components/ui/SiteName/SiteName";

const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STAT_CARDS = [
  {
    key: "orders",
    label: "Total Orders",
    icon: "ri:clipboard-line",
    href: "/orders",
    color: "#3355c9",
    bg: "#eaf0ff",
  },
  {
    key: "shipments",
    label: "Total Shipments",
    icon: "ri:ship-line",
    href: "/shipments",
    color: "#203975",
    bg: "#2039754D",
  },
  {
    key: "drums",
    label: "Available Drums",
    icon: "ri:box-3-line",
    href: "/drums",
    color: "#b46a12",
    bg: "#fff4e5",
  },
  {
    key: "clients",
    label: "Total Clients",
    icon: "ri:building-line",
    href: "/clients",
    color: "#b6297f",
    bg: "#fdeef7",
  },
] as const;

/** Small hand-rolled SVG donut — no charting library needed. */
function StatusDonut({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const segmentsWithOffset = segments.reduce(
    (acc, s) => {
      const length = (s.value / total) * circumference;
      const offset =
        acc.length > 0
          ? acc[acc.length - 1].offset + acc[acc.length - 1].length
          : 0;
      return [...acc, { ...s, length, offset }];
    },
    [] as {
      label: string;
      value: number;
      color: string;
      length: number;
      offset: number;
    }[],
  );

  return (
    <div className="d-flex align-items-center gap-4 flex-wrap">
      <svg
        width={112}
        height={112}
        viewBox="0 0 112 112"
        style={{ flexShrink: 0 }}
      >
        <g transform="rotate(-90 56 56)">
          <circle
            cx={56}
            cy={56}
            r={radius}
            fill="none"
            stroke="#eef0f3"
            strokeWidth={14}
          />
          {segmentsWithOffset.map((s) => (
            <circle
              key={s.label}
              cx={56}
              cy={56}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={14}
              strokeDasharray={`${s.length} ${circumference - s.length}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text
          x={56}
          y={52}
          textAnchor="middle"
          fontSize={22}
          fontWeight={800}
          fill="#1f2430"
        >
          {total}
        </text>
        <text x={56} y={68} textAnchor="middle" fontSize={10} fill="#6b7280">
          shipments
        </text>
      </svg>
      <div className="d-flex flex-column gap-2">
        {segments.map((s) => (
          <div key={s.label} className="d-flex align-items-center gap-2 small">
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 999,
                background: s.color,
                display: "inline-block",
              }}
            />
            <span className="text-muted">{s.label}</span>
            <span className="fw-bold">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Clients, Orders, Drums, Shipments, and Truck Deliveries all come from
  // the real backend now — fetched client-side (via authApi, which
  // attaches the real access token). There's no local mock
  // /api/dashboard route anymore; every entity is real.
  const { data: clientsData } = useQuery({
    queryKey: ["dashboard-clients"],
    queryFn: () => getClients({}),
  });
  const { data: ordersData } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: () => getOrders({ ordering: "-created_at" }),
  });
  const { data: availableDrumsData } = useQuery({
    queryKey: ["dashboard-drums-available"],
    queryFn: () => getDrums({ search: "" }),
  });
  const { data: shipmentsData } = useQuery({
    queryKey: ["dashboard-shipments"],
    queryFn: () => getShipments({ ordering: "-created_at" }),
  });
  const { data: truckDeliveriesData } = useQuery({
    queryKey: ["dashboard-truck-deliveries"],
    queryFn: () => getTruckDeliveries({}),
  });

  const recentOrders = (ordersData?.results ?? []).slice(0, 5);
  const recentShipments = (shipmentsData?.results ?? []).slice(0, 5);
  // NOTE: /api/drums/ and /api/shipments/ have no "give me all pages at
  // once" mode, so these counts only reflect whatever page was fetched,
  // not the full dataset — an approximation, not an exact global count.
  const availableDrumsCount = (availableDrumsData?.results ?? []).filter(
    (d) => d.status === "AVAILABLE",
  ).length;
  const shipmentStatusCounts = {
    created: (shipmentsData?.results ?? []).filter(
      (s) => s.status === "CREATED",
    ).length,
    inTransit: (shipmentsData?.results ?? []).filter(
      (s) => s.status === "IN_TRANSIT",
    ).length,
    delivered: (shipmentsData?.results ?? []).filter(
      (s) => s.status === "DELIVERED",
    ).length,
  };

  const statValues: Record<string, string | number> = {
    orders: ordersData ? ordersData.count : "—",
    shipments: shipmentsData ? shipmentsData.count : "—",
    drums: availableDrumsData
      ? `${availableDrumsCount}/${availableDrumsData.count}`
      : "—",
    clients: clientsData ? clientsData.count : "—",
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Welcome back</h4>
          <p className="text-muted small mb-0">
            Here&apos;s what&apos;s moving through Drum Tracer today.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/shipments" className="btn btn-sm btn-outline-secondary">
            <IconifyIcon icon="ri:ship-line" className="me-1" /> View Shipments
          </Link>
          <Link href="/orders" className="btn btn-sm btn-primary">
            <IconifyIcon icon="ri:add-line" className="me-1" /> View Orders
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {STAT_CARDS.map((card) => (
          <div className="col-md-3 col-6" key={card.key}>
            <Link href={card.href} className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: card.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconifyIcon
                      icon={card.icon}
                      width={22}
                      height={22}
                      style={{ color: card.color }}
                    />
                  </div>
                  <div>
                    <div className="text-muted small">{card.label}</div>
                    <div className="fs-4 fw-bold text-dark">
                      {statValues[card.key]}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Shipment Status Mix</h6>
              {!shipmentsData ? (
                <div className="placeholder-glow">
                  <span
                    className="placeholder col-12"
                    style={{ height: 100 }}
                  />
                </div>
              ) : (
                <StatusDonut
                  segments={[
                    {
                      label: "Created",
                      value: shipmentStatusCounts.created,
                      color: "#c7cbd4",
                    },
                    {
                      label: "In Transit",
                      value: shipmentStatusCounts.inTransit,
                      color: "#3355c9",
                    },
                    {
                      label: "Delivered",
                      value: shipmentStatusCounts.delivered,
                      color: "#203975",
                    },
                  ]}
                />
              )}
              <hr className="my-3" />
              <Link
                href="/truck-deliveries"
                className="text-decoration-none d-flex align-items-center gap-1 small"
              >
                <IconifyIcon
                  icon="ri:truck-line"
                  style={{ color: "#203975" }}
                />
                <span>
                  {truckDeliveriesData ? truckDeliveriesData.count : "—"} truck
                  deliveries
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Recent Orders</h6>
                <Link
                  href="/orders"
                  className="small fw-bold text-decoration-none"
                >
                  View all
                </Link>
              </div>
              {!ordersData ? (
                <div className="placeholder-glow">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="placeholder col-12 mb-2 d-block"
                      style={{ height: 40 }}
                    />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-muted small mb-0">No orders yet.</p>
              ) : (
                recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="d-flex align-items-center gap-3 py-2 border-bottom text-decoration-none text-dark"
                  >
                    <Avatar name={o.client_details?.name ?? "?"} size={34} />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold text-truncate">
                        {o.order_number}
                      </div>
                      <div className="small text-muted text-truncate">
                        {o.client_details?.name ?? "Unknown"}
                      </div>
                    </div>
                    <StatusBadge
                      status={ORDER_STATUS_LABELS[o.status] ?? o.status}
                      size="sm"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Recent Shipments</h6>
                <Link
                  href="/shipments"
                  className="small fw-bold text-decoration-none"
                >
                  View all
                </Link>
              </div>
              {!shipmentsData ? (
                <div className="placeholder-glow">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="placeholder col-12 mb-2 d-block"
                      style={{ height: 40 }}
                    />
                  ))}
                </div>
              ) : recentShipments.length === 0 ? (
                <p className="text-muted small mb-0">No shipments yet.</p>
              ) : (
                recentShipments.map((s) => (
                  <Link
                    key={s.id}
                    href={`/shipments/${s.id}`}
                    className="d-flex align-items-center gap-3 py-2 border-bottom text-decoration-none text-dark"
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: "#2039754D",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <IconifyIcon
                        icon="ri:ship-line"
                        style={{ color: "#203975" }}
                        width={16}
                        height={16}
                      />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold text-truncate">
                        {s.shipment_number}
                      </div>
                      <div className="small text-muted text-truncate">
                        <SiteName siteId={s.destination_site} />
                      </div>
                    </div>
                    <StatusBadge
                      status={SHIPMENT_STATUS_LABELS[s.status] ?? s.status}
                      size="sm"
                    />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
