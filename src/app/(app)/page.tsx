"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import Avatar from "@/components/ui/Avatar/Avatar";

interface DashboardData {
  orders: { total: number; created: number; assigned: number; completed: number };
  shipments: { total: number; created: number; inTransit: number; delivered: number };
  drums: { total: number; available: number; inTransit: number; missing: number };
  truckDeliveries: { total: number; scheduled: number };
  clients: number;
  sites: number;
  recentOrders: { id: number; po_number: string; client_name: string; status: string; created_at: string }[];
  recentShipments: {
    id: number;
    shipment_number: string;
    destination_site_name: string;
    status: string;
    expected_arrival: string;
  }[];
}

const STAT_CARDS = [
  { key: "orders", label: "Total Orders", icon: "ri:clipboard-line", href: "/orders", color: "#3355c9", bg: "#eaf0ff" },
  { key: "shipments", label: "Total Shipments", icon: "ri:ship-line", href: "/shipments", color: "#203975", bg: "#e7f5f0" },
  { key: "drums", label: "Available Drums", icon: "ri:box-3-line", href: "/drums", color: "#b46a12", bg: "#fff4e5" },
  { key: "clients", label: "Clients & Sites", icon: "ri:building-line", href: "/clients", color: "#b6297f", bg: "#fdeef7" },
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
  let offset = 0;

  return (
      <div className="d-flex align-items-center gap-4 flex-wrap">
        <svg width={112} height={112} viewBox="0 0 112 112" style={{ flexShrink: 0 }}>
          <g transform="rotate(-90 56 56)">
            <circle cx={56} cy={56} r={radius} fill="none" stroke="#eef0f3" strokeWidth={14} />
            {segments.map((s) => {
              const length = (s.value / total) * circumference;
              const dasharray = `${length} ${circumference - length}`;
              const circle = (
                  <circle
                      key={s.label}
                      cx={56}
                      cy={56}
                      r={radius}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={14}
                      strokeDasharray={dasharray}
                      strokeDashoffset={-offset}
                      strokeLinecap="butt"
                  />
              );
              // eslint-disable-next-line react-hooks/immutability
              offset += length;
              return circle;
            })}
          </g>
          <text x={56} y={52} textAnchor="middle" fontSize={22} fontWeight={800} fill="#1f2430">
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
                style={{ width: 9, height: 9, borderRadius: 999, background: s.color, display: "inline-block" }}
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
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
        .then((r) => r.json())
        .then(setData);
  }, []);

  const statValues: Record<string, string | number> = data
      ? {
        orders: data.orders.total,
        shipments: data.shipments.total,
        drums: `${data.drums.available}/${data.drums.total}`,
        clients: `${data.clients} / ${data.sites}`,
      }
      : {};

  return (
      <>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <h4 className="mb-0 fw-bold">Welcome back 👋</h4>
            <p className="text-muted small mb-0">Here&apos;s what&apos;s moving through Drum Tracer today.</p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/shipments/create" className="btn btn-sm btn-outline-secondary">
              <IconifyIcon icon="ri:ship-line" className="me-1" />
              New Shipment
            </Link>
            <Link href="/orders/create" className="btn btn-sm btn-primary">
              <IconifyIcon icon="ri:add-line" className="me-1" />
              New Order
            </Link>
          </div>
        </div>

        <div className="row g-3 mb-3">
          {STAT_CARDS.map((card) => (
              <div className="col-md-3 col-6" key={card.key}>
                <Link href={card.href} className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm" style={{ transition: "transform .15s" }}>
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
                        <IconifyIcon icon={card.icon} width={22} height={22} style={{ color: card.color }} />
                      </div>
                      <div>
                        <div className="text-muted small">{card.label}</div>
                        <div className="fs-4 fw-bold text-dark">
                          {data ? statValues[card.key] : <span className="placeholder col-6" />}
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
                {!data ? (
                    <div className="placeholder-glow">
                      <span className="placeholder col-12" style={{ height: 100 }} />
                    </div>
                ) : (
                    <StatusDonut
                        segments={[
                          { label: "Created", value: data.shipments.created, color: "#c7cbd4" },
                          { label: "In Transit", value: data.shipments.inTransit, color: "#203975" },
                          {
                            label: "Delivered",
                            value: data.shipments.delivered,
                            color: "#0f7a63",
                          },
                        ]}
                    />
                )}
                <hr className="my-3" />
                <div className="d-flex justify-content-between small">
                  <Link href="/truck-deliveries" className="text-decoration-none d-flex align-items-center gap-1">
                    <IconifyIcon icon="ri:truck-line" style={{ color: "#203975" }} />
                    <span>{data?.truckDeliveries.total ?? "—"} truck deliveries</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Recent Orders</h6>
                  <Link href="/orders" className="small fw-bold text-decoration-none">
                    View all
                  </Link>
                </div>
                {!data ? (
                    <div className="placeholder-glow">
                      {[1, 2, 3].map((i) => (
                          <span key={i} className="placeholder col-12 mb-2 d-block" style={{ height: 40 }} />
                      ))}
                    </div>
                ) : data.recentOrders.length === 0 ? (
                    <p className="text-muted small mb-0">No orders yet.</p>
                ) : (
                    data.recentOrders.map((o) => (
                        <Link
                            key={o.id}
                            href={`/orders`}
                            className="d-flex align-items-center gap-3 py-2 border-bottom text-decoration-none text-dark"
                        >
                          <Avatar name={o.client_name} size={34} />
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-bold text-truncate">{o.po_number}</div>
                            <div className="small text-muted text-truncate">{o.client_name}</div>
                          </div>
                          <StatusBadge status={o.status} size="sm" />
                        </Link>
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
                  <Link href="/shipments" className="small fw-bold text-decoration-none">
                    View all
                  </Link>
                </div>
                {!data ? (
                    <div className="placeholder-glow">
                      {[1, 2, 3].map((i) => (
                          <span key={i} className="placeholder col-12 mb-2 d-block" style={{ height: 40 }} />
                      ))}
                    </div>
                ) : data.recentShipments.length === 0 ? (
                    <p className="text-muted small mb-0">No shipments yet.</p>
                ) : (
                    data.recentShipments.map((s) => (
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
                                background: "#e7f5f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                          >
                            <IconifyIcon icon="ri:ship-line" style={{ color: "#203975" }} width={16} height={16} />
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="fw-bold text-truncate">{s.shipment_number}</div>
                            <div className="small text-muted text-truncate">{s.destination_site_name}</div>
                          </div>
                          <StatusBadge status={s.status} size="sm" />
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
