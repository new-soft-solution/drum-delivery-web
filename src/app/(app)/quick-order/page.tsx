"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { QuickOrderStepper } from "./components/QuickOrderStepper";
import { QuickOrderStepOrder } from "./components/QuickOrderStepOrder";
import { QuickOrderStepShipment } from "./components/QuickOrderStepShipment";
import { QuickOrderStepTruckDelivery } from "./components/QuickOrderStepTruckDelivery";

export interface QuickOrderState {
  orderId?: string;
  orderNumber?: string;
  shipmentId?: string;
  shipmentNumber?: string;
  drumCount?: number;
  truckDeliveryId?: string;
  truckDeliveryLabel?: string;
}

export default function QuickOrderPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<QuickOrderState>({});
  const [done, setDone] = useState(false);

  const furthestStep = state.truckDeliveryId
    ? 3
    : state.shipmentId
      ? 2
      : state.orderId
        ? 1
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
              Order {state.orderNumber}, shipment {state.shipmentNumber} (
              {state.drumCount ?? 0} drum(s)), and a truck delivery have all
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
                  setState({});
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
        Create an order, a shipment (with its drums), and a truck delivery in
        one guided flow.
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
            <QuickOrderStepShipment
              state={state}
              onBack={() => setStepIndex(0)}
              onCreated={(shipmentId, shipmentNumber, drumCount) => {
                setState((s) => ({
                  ...s,
                  shipmentId,
                  shipmentNumber,
                  drumCount,
                }));
                setStepIndex(2);
              }}
            />
          )}
          {stepIndex === 2 && (
            <QuickOrderStepTruckDelivery
              state={state}
              onBack={() => setStepIndex(1)}
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
