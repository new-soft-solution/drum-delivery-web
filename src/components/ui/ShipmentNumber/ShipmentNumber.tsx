"use client";
import { useQuery } from "@tanstack/react-query";
import { getShipment } from "@/services/shipment.service";

export const ShipmentNumber = ({
  shipmentId,
}: {
  shipmentId?: string | null;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["shipment-number", shipmentId],
    queryFn: () => getShipment(shipmentId as string),
    enabled: !!shipmentId,
    staleTime: 5 * 60 * 1000,
  });

  if (!shipmentId) return <span className="text-muted">—</span>;
  if (isLoading) return <span className="text-muted">Loading…</span>;
  return <>{data?.shipment_number ?? "Unknown shipment"}</>;
};

export default ShipmentNumber;
