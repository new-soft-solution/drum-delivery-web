"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { ShipmentTable } from "./components/ShipmentTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

const ShipmentsPage = () => {
  return (
    <>
      <PageHeader icon="ri:ship-line" title="Shipments" subtitle="Track cable drums from port to site" />
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="pt-0">
              <ShipmentTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ShipmentsPage;
