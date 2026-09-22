"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { DrumTable } from "./components/DrumTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import RequireModuleView from "@/components/ui/RequireModuleView/RequireModuleView";

const DrumsPage = () => {
  return (
    <RequireModuleView module="drums">
      <PageHeader
        icon="ri:box-3-line"
        title="Drums"
        subtitle="Cable drums across all containers and shipments"
      />
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="pt-0">
              <DrumTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </RequireModuleView>
  );
};

export default DrumsPage;
