"use client";
import { useState } from "react";
import { Button, Dropdown, Table } from "react-bootstrap";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getShipment, setShipmentDrums } from "@/services/shipment.service";
import { getDrums, updateDrum } from "@/services/drum.service";
import { DRUM_STATUS_LABELS } from "@/types/drum.type";
import { useNotificationContext } from "@/context/useNotificationContext";
import StatusBadge from "@/components/StatusBadge/StatusBadge";
import Spinner from "@/components/Spinner";
import { AssignDrumsModal } from "./AssignDrumsModal";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { QuickCreateDrumModal } from "@/app/(app)/shipments/components/QuickCreateDrumModal";
import { BulkImportDrumsModal } from "@/app/(app)/drums/components/BulkImportDrumsModal";

export const ShipmentDrumsTab = ({ shipmentId }: { shipmentId: string }) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotificationContext();
  const [showAssign, setShowAssign] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: () => getShipment(shipmentId),
  });

  const drumIds = shipment?.drums ?? [];
  const { data, isLoading: drumsLoading } = useQuery({
    queryKey: ["shipment-drums-detail", shipmentId, drumIds],
    queryFn: () =>
      getDrums({ ids: drumIds.toString(), page_size: drumIds.length }),
    enabled: drumIds.length > 0,
  });
  const drums = data?.results;
  const isLoading = shipmentLoading || (drumIds.length > 0 && drumsLoading);

  const removeMutation = useMutation({
    mutationFn: async (drumId: string) => {
      await setShipmentDrums(
        shipmentId,
        drumIds.filter((id) => id !== drumId),
      );
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

  // Drums page.
  const linkMutation = useMutation({
    mutationFn: (drumId: string) =>
      setShipmentDrums(shipmentId, [...drumIds, drumId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shipment", shipmentId] });
      queryClient.invalidateQueries({ queryKey: ["drums"] });
    },
    onError: () =>
      showNotification({
        message:
          "Drum created, but couldn't be linked to this shipment automatically — use Assign Drums.",
        variant: "danger",
      }),
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Drums in this Shipment</h5>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowAssign(true)}
          >
            + Assign Drums
          </Button>
          <Dropdown align="end">
            <Dropdown.Toggle variant="primary" size="sm">
              + New Drum
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setShowCreate(true)}>
                Single drum
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setShowBulkImport(true)}>
                Bulk import (.xlsx)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : drumIds.length === 0 ? (
        <EmptyState
          icon="ri:box-3-line"
          title="No drums assigned yet"
          description="Assign drums from your available inventory to this shipment, or create a new one."
          actionLabel="Assign Drums"
          onAction={() => setShowAssign(true)}
        />
      ) : (
        <Table responsive hover>
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
            {(drums ?? []).map((d) => (
              <tr key={d.id}>
                <td className="fw-bold">{d.drum_number}</td>
                <td>{d.container_no || "—"}</td>
                <td>{d.length_kms}</td>
                <td>{d.net_weight_mt}</td>
                <td>{d.gross_weight_mt}</td>
                <td>
                  <StatusBadge
                    status={DRUM_STATUS_LABELS[d.status] ?? d.status}
                  />
                </td>
                <td>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-danger"
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(d.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <AssignDrumsModal
        show={showAssign}
        onHide={() => setShowAssign(false)}
        shipmentId={shipmentId}
        currentDrumIds={drumIds}
      />

      <QuickCreateDrumModal
        show={showCreate}
        onHide={() => setShowCreate(false)}
        onCreated={(drum) => {
          setShowCreate(false);
          linkMutation.mutate(drum.id);
        }}
      />

      <BulkImportDrumsModal
        show={showBulkImport}
        onHide={() => setShowBulkImport(false)}
        onImported={() =>
          showNotification({
            message:
              'Drums imported. Use "Assign Drums" above to link the new ones to this shipment.',
            variant: "success",
          })
        }
      />
    </div>
  );
};

export default ShipmentDrumsTab;
