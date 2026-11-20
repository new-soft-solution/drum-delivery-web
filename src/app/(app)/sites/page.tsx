"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { SiteTable } from "./components/SiteTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import RequireModuleView from "@/components/ui/RequireModuleView/RequireModuleView";

const SitesPage = () => {
  return (
    <RequireModuleView module="sites">
      <PageHeader
        icon="ri:map-pin-line"
        title="Sites"
        subtitle="Delivery destinations for shipments"
      />
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="pt-0">
              <SiteTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </RequireModuleView>
  );
};

export default SitesPage;
