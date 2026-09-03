"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { OrderTable } from "./components/OrderTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

const OrdersPage = () => {
  return (
    <>
      <PageHeader icon="ri:clipboard-line" title="Orders" subtitle="Purchase orders placed by clients" />
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="pt-0">
              <OrderTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrdersPage;
