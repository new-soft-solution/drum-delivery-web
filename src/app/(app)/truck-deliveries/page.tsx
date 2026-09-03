"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { TruckDeliveryTable } from "./components/TruckDeliveryTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

const TruckDeliveriesPage = () => {
  return (
    <>
      <PageHeader
        icon="ri:truck-line"
        title="Truck Deliveries"
        subtitle="Final-mile deliveries from Rotterdam port to client sites"
      />
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="pt-0">
              <TruckDeliveryTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TruckDeliveriesPage;
