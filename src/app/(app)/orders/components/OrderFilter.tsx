"use client";
import { Form } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { getClients } from "@/services/client.service";
import { ORDER_STATUS_OPTIONS, OrderFilterType } from "@/types/order.type";

interface FilterProps {
  tempFilters: OrderFilterType;
  onTempFilterChange: (filters: OrderFilterType) => void;
}

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED_TO_SHIPMENT: "Assigned to Shipment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// /api/orders/ (confirmed) supports status and client as dedicated query
// filters, alongside the free-text `search`.
const OrderFilter = ({ tempFilters, onTempFilterChange }: FilterProps) => {
  const { data: clientsData } = useQuery({
    queryKey: ["clients-for-order-filter"],
    queryFn: () => getClients({}),
  });

  return (
    <div className="row g-3">
      <div className="col-12">
        <Form.Group>
          <Form.Label>Status</Form.Label>
          <Form.Select
            value={tempFilters.status || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                status: e.target.value || undefined,
              })
            }
          >
            <option value="">All Statuses</option>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
      <div className="col-12">
        <Form.Group>
          <Form.Label>Client</Form.Label>
          <Form.Select
            value={tempFilters.client || ""}
            onChange={(e) =>
              onTempFilterChange({
                ...tempFilters,
                client: e.target.value || undefined,
              })
            }
          >
            <option value="">All Clients</option>
            {clientsData?.results.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </div>
    </div>
  );
};

export default OrderFilter;
