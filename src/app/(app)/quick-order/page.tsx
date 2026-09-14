"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { QuickOrderStepper } from "./components/QuickOrderStepper";
import { QuickOrderStepOrder } from "./components/QuickOrderStepOrder";
import { QuickOrderStepDrums } from "./components/QuickOrderStepDrums";
import { QuickOrderStepShipment } from "./components/QuickOrderStepShipment";
import { QuickOrderStepTruckDelivery } from "./components/QuickOrderStepTruckDelivery";

export interface QuickOrderState {
  orderId?: string;
  orderNumber?: string;
  drumIds: string[];
  shipmentId?: string;
  shipmentNumber?: string;
  truckDeliveryId?: string;
  truckDeliveryLabel?: string;
}

export default function QuickOrderPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<QuickOrderState>({ drumIds: [] });
  const [done, setDone] = useState(false);

  const furthestStep = state.truckDeliveryId
    ? 4
    : state.shipmentId
      ? 3
      : state.orderId
        ? 2
        : 0;

  const goTo = (index: number) => {
    if (index <= furthestStep) setStepIndex(index);
  };

  if (done) {
    return (
      <div className="container-fluid py-3" style={{ maxWidth: 720 }}>
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center"
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#e6f7ef",
              }}
            >
              <IconifyIcon
                icon="ri:check-line"
                width={32}
                height={32}

                className={"text-primary"}
              />
            </div>
            <h4 className="fw-bold mb-2">Quick Order complete</h4>
            <p className="text-muted mb-4">
              Order {state.orderNumber}, {state.drumIds.length} drum(s),
              shipment {state.shipmentNumber}, and a truck delivery have all
              been created and linked together.
            </p>
            <div className="d-flex justify-content-center gap-2 flex-wrap">
              <Link href="/orders" className="btn btn-outline-secondary btn-sm">
                View Orders
              </Link>
              <Link
                href={`/shipments/${state.shipmentId}`}
                className="btn btn-outline-secondary btn-sm"
              >
                View Shipment
              </Link>
              <Link
                href="/truck-deliveries"
                className="btn btn-outline-secondary btn-sm"
              >
                View Truck Deliveries
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setState({ drumIds: [] });
                  setStepIndex(0);
                  setDone(false);
                }}
              >
                Start another Quick Order
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3" style={{ maxWidth: 8120 }}>
      <h4 className="fw-bold mb-1">Quick Order</h4>
      <p className="text-muted small mb-4">
        Create an order, its drums, a shipment, and a truck delivery in one
        guided flow.
      </p>

      <QuickOrderStepper
        current={stepIndex}
        furthest={furthestStep}
        onStepClick={goTo}
      />

      <div className="card border-0 shadow-sm mt-3">
        <div className="card-body">
          {stepIndex === 0 && (
            <QuickOrderStepOrder
              state={state}
              onCreated={(orderId, orderNumber) => {
                setState((s) => ({ ...s, orderId, orderNumber }));
                setStepIndex(1);
              }}
            />
          )}
          {stepIndex === 1 && (
            <QuickOrderStepDrums
              state={state}
              onBack={() => setStepIndex(0)}
              onNext={(drumIds) => {
                setState((s) => ({ ...s, drumIds }));
                setStepIndex(2);
              }}
            />
          )}
          {stepIndex === 2 && (
            <QuickOrderStepShipment
              state={state}
              onBack={() => setStepIndex(1)}
              onCreated={(shipmentId, shipmentNumber) => {
                setState((s) => ({ ...s, shipmentId, shipmentNumber }));
                setStepIndex(3);
              }}
            />
          )}
          {stepIndex === 3 && (
            <QuickOrderStepTruckDelivery
              state={state}
              onBack={() => setStepIndex(2)}
              onCreated={(truckDeliveryId, truckDeliveryLabel) => {
                setState((s) => ({
                  ...s,
                  truckDeliveryId,
                  truckDeliveryLabel,
                }));
                setDone(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
