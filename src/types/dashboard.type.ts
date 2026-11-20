import type { Order } from "./order.type";
import type { Shipment, ShipmentStatus } from "./shipment.type";
import type { TruckDelivery } from "./truck-delivery.type";

export interface DashboardTotals {
  shipments: number;
  orders: number;
  available_drums: number;
  clients: number;
}

export type DashboardShipmentStatusCounts = Partial<
  Record<ShipmentStatus, number>
>;

export interface DashboardData {
  totals: DashboardTotals;
  recent_orders: Order[];
  recent_shipments: Shipment[];
  recent_truck_deliveries: TruckDelivery[];
  shipment_statuses: DashboardShipmentStatusCounts;
}
