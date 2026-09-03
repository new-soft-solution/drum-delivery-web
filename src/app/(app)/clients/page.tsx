"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { ClientTable } from "./components/ClientTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";

const ClientsPage = () => {
  return (
    <>
      <PageHeader
        icon="ri:building-line"
        title="Clients"
        subtitle="Companies you ship cable orders for"
      />
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="pt-0">
              <ClientTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ClientsPage;
