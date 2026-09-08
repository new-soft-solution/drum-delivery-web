"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Nav, TabContainer, TabContent, TabPane } from "react-bootstrap";
import { getShipment } from "@/services/shipment.service";
import { SHIPMENT_STATUS_LABELS } from "@/types/shipment.type";
import Spinner from "@/components/Spinner";
import ErrorMessage from "@/components/ui/ErrorMessage/ErrorMessage";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import DetailRow from "@/components/ui/DetailRow/DetailRow";
import { ShipmentDrumsTab } from "./components/ShipmentDrumsTab";
import { ShipmentOrdersTab } from "./components/ShipmentOrdersTab";
import { SiteName } from "@/components/ui/SiteName/SiteName";
import { formatDateNL } from "@/utils/dateFormatter";

export default function ShipmentDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");

  const {
    data: shipment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => getShipment(id),
    enabled: !!id,
  });

  if (isLoading) return <Spinner fullCentered />;
  if (isError || !shipment)
    return <ErrorMessage message="Shipment not found" />;

  return (
    <div className="container-fluid py-3">
      <Link
        href="/shipments"
        className="d-inline-flex align-items-center gap-1 mb-3 fw-bold text-decoration-none"
      >
        ← Back to Shipments
      </Link>

      <div className="card mb-3 border-0 shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "linear-gradient(135deg, #203975, #203975cc)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontSize: 20 }}>🚢</span>
            </div>
            <div>
              <h4 className="mb-0 fw-bold">{shipment.shipment_number}</h4>
              <span className="text-muted small">
                Created on {formatDateNL(shipment.created_at)}
              </span>
            </div>
          </div>
          <StatusBadge
            status={SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status}
            size="lg"
          />
        </div>
      </div>

      <TabContainer defaultActiveKey="basic">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="basic">Basic Information</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="drums">
              Drums ({shipment.drums.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="orders">
              Orders ({shipment.orders.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <TabContent>
          <TabPane eventKey="basic">
            <div className="card">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <DetailRow
                      label="Shipment Number"
                      value={shipment.shipment_number}
                      icon="ri-ship-line"
                    />
                    <DetailRow
                      label="Destination"
                      value={<SiteName siteId={shipment.destination_site} />}
                      icon="ri-map-pin-line"
                    />
                    <DetailRow
                      label="Invoice Number"
                      value={shipment.invoice_no || "—"}
                      icon="ri-file-list-3-line"
                    />
                    <DetailRow
                      label="BL Number"
                      value={shipment.bl_no || "—"}
                      icon="ri-file-text-line"
                    />
                  </div>
                  <div className="col-md-6">
                    <DetailRow
                      label="Expected Arrival"
                      value={
                        shipment.expected_arrival_date
                          ? formatDateNL(shipment.expected_arrival_date)
                          : "—"
                      }
                      icon="ri-calendar-event-line"
                    />
                    <DetailRow
                      label="Status"
                      value={
                        <StatusBadge
                          status={
                            SHIPMENT_STATUS_LABELS[shipment.status] ??
                            shipment.status
                          }
                        />
                      }
                      icon="ri-radar-line"
                    />
                    <DetailRow
                      label="Linked Orders"
                      value={shipment.orders.length}
                      icon="ri-clipboard-line"
                    />
                    <DetailRow
                      label="Linked Drums"
                      value={shipment.drums.length}
                      icon="ri-box-3-line"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
          <TabPane eventKey="drums">
            <div className="card">
              <div className="card-body">
                <ShipmentDrumsTab shipmentId={id} />
              </div>
            </div>
          </TabPane>
          <TabPane eventKey="orders">
            <div className="card">
              <div className="card-body">
                <ShipmentOrdersTab shipmentId={id} />
              </div>
            </div>
          </TabPane>
        </TabContent>
      </TabContainer>
    </div>
  );
}
