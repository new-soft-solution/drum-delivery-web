"use client";
import { useState } from "react";
import { Accordion, Button, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getShipment, removeShipmentDrum } from "@/services/shipment.service";
import { getDrums, updateDrum } from "@/services/drum.service";
import { DRUM_STATUS_LABELS } from "@/types/drum.type";
import { formatDrumNumber } from "@/utils/formatDrumNumber";
import { useNotificationContext } from "@/context/useNotificationContext";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Spinner from "@/components/Spinner";
import { AssignDrumsModal } from "./AssignDrumsModal";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

// Fetches drum details only once its site accordion is expanded.
const SiteDrumsTable = ({
  shipmentId,
  siteId,
  drumIds,
  removing,
  onRemove,
}: {
  shipmentId: string;
  siteId: string;
  drumIds: string[];
  removing: boolean;
  onRemove: (drumId: string) => void;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["shipment-site-drums", shipmentId, siteId, drumIds],
    queryFn: () =>
      getDrums({ ids: drumIds.toString(), page_size: drumIds.length }),
    enabled: drumIds.length > 0,
  });
  const drums = data?.results ?? [];

  if (drumIds.length === 0) {
    return (
      <p className="text-muted text-center py-3 mb-0">
        No drums assigned to this site yet.
      </p>
    );
  }
  if (isLoading) return <Spinner />;

  return (
    <Table responsive hover className="mb-0">
      <thead>
        <tr>
          <th>Drum Number</th>
          <th>Container</th>
          <th>Length (KMs)</th>
          <th>Net (MT)</th>
          <th>Gross (MT)</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {drums.map((d) => (
          <tr key={d.id}>
            <td className="fw-bold">{formatDrumNumber(d.drum_number)}</td>
            <td>{d.container_no || "—"}</td>
            <td>{d.length_kms}</td>
            <td>{d.net_weight_mt}</td>
            <td>{d.gross_weight_mt}</td>
            <td>
              <StatusBadge status={DRUM_STATUS_LABELS[d.status] ?? d.status} />
            </td>
            <td>
              <Button
                variant="link"
                size="sm"
                className="text-danger"
                disabled={removing}
                onClick={() => onRemove(d.id)}
              >
                Remove
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export const ShipmentDrumsTab = ({ shipmentId }: { shipmentId: string }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [assignSiteId, setAssignSiteId] = useState<string | null>(null);
  const [openSites, setOpenSites] = useState<string[]>([]);

  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => getShipment(shipmentId),
  });

  const sites = shipment?.sites ?? [];

  const removeMutation = useMutation({
    mutationFn: async (drumId: string) => {
      await removeShipmentDrum(shipmentId, sites, drumId);
      try {
        await updateDrum(drumId, { status: "AVAILABLE" });
      } catch {
        // best-effort only
      }
    },
    onSuccess: () => {
      showNotification({
        message: "Drum removed from shipment",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
    },
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Drums in this Shipment</h5>
      </div>

      {shipmentLoading ? (
        <Spinner />
      ) : sites.length === 0 ? (
        <EmptyState
          icon="ri:map-pin-line"
          title="No destination sites"
          description="Add a destination site to this shipment before assigning drums."
        />
      ) : (
        <Accordion
          alwaysOpen
          activeKey={openSites}
          onSelect={(key) =>
            setOpenSites(Array.isArray(key) ? key : key ? [key] : [])
          }
          className="d-flex flex-column gap-3"
        >
          {sites.map((s) => {
            return (
              <Accordion.Item
                eventKey={s.site}
                key={s.site}
                className="border rounded"
              >
                <Accordion.Header>
                  <div className="d-flex align-items-center justify-content-between w-100 me-3">
                    <span>{s.site_name}</span>
                    <span className="text-muted">
                      Drums ({(s.drums ?? []).length})
                    </span>
                    <Button
                      as="span"
                      role="button"
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssignSiteId(s.site);
                      }}
                    >
                      Assign Drums
                    </Button>
                  </div>
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  {openSites.includes(s.site) && (
                    <SiteDrumsTable
                      shipmentId={shipmentId}
                      siteId={s.site}
                      drumIds={s.drums ?? []}
                      removing={removeMutation.isPending}
                      onRemove={(id) => removeMutation.mutate(id)}
                    />
                  )}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      )}

      <AssignDrumsModal
        key={assignSiteId ?? "none"}
        show={assignSiteId !== null}
        onHide={() => setAssignSiteId(null)}
        shipmentId={shipmentId}
        sites={sites}
        siteId={assignSiteId ?? ""}
      />
    </div>
  );
};

export default ShipmentDrumsTab;
