"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { ClientTable } from "./components/ClientTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import RequireModuleView from "@/components/ui/RequireModuleView/RequireModuleView";

const ClientsPage = () => {
  return (
    <RequireModuleView module="clients">
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
    </RequireModuleView>
  );
};

export default ClientsPage;
