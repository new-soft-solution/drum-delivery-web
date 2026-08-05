"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge/StatusBadge";

interface DashboardData {
  orders: { total: number; created: number; assigned: number; completed: number };
  shipments: { total: number; created: number; inTransit: number; delivered: number };
  drums: { total: number; available: number };
  recentOrders: { id: number; po_number: string; client_name: string; status: string; created_at: string }[];
  recentShipments: {
    id: number;
    shipment_number: string;
    destination_site_name: string;
    status: string;
    expected_arrival: string;
  }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Dashboard</h4>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Total Orders</div>
              <div className="fs-3 fw-bold">{data?.orders.total ?? "—"}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Total Shipments</div>
              <div className="fs-3 fw-bold">{data?.shipments.total ?? "—"}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Shipments In Transit</div>
              <div className="fs-3 fw-bold">{data?.shipments.inTransit ?? "—"}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card">
            <div className="card-body">
              <div className="text-muted small">Available Drums</div>
              <div className="fs-3 fw-bold">
                {data ? `${data.drums.available} / ${data.drums.total}` : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent Orders</h6>
                <Link href="/orders" className="small fw-bold">
                  View all →
                </Link>
              </div>
              {!data ? (
                <p className="text-muted">Loading...</p>
              ) : data.recentOrders.length === 0 ? (
                <p className="text-muted mb-0">No orders yet.</p>
              ) : (
                data.recentOrders.map((o) => (
                  <div key={o.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-bold">{o.po_number}</div>
                      <div className="small text-muted">{o.client_name}</div>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Recent Shipments</h6>
                <Link href="/shipments" className="small fw-bold">
                  View all →
                </Link>
              </div>
              {!data ? (
                <p className="text-muted">Loading...</p>
              ) : data.recentShipments.length === 0 ? (
                <p className="text-muted mb-0">No shipments yet.</p>
              ) : (
                data.recentShipments.map((s) => (
                  <Link
                    key={s.id}
                    href={`/shipments/${s.id}`}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom text-decoration-none text-dark"
                  >
                    <div>
                      <div className="fw-bold">{s.shipment_number}</div>
                      <div className="small text-muted">{s.destination_site_name}</div>
                    </div>
                    <StatusBadge status={s.status} />
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
