"use client";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import { UserTable } from "./components/UserTable";
import PageHeader from "@/components/ui/PageHeader/PageHeader";
import RequireModuleView from "@/components/ui/RequireModuleView/RequireModuleView";

const UsersPage = () => {
  return (
    <RequireModuleView module="users">
      <PageHeader
        icon="ri:user-settings-line"
        title="Users"
        subtitle="Manage system users and access"
      />
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <CardBody className="pt-0">
              <UserTable />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </RequireModuleView>
  );
};

export default UsersPage;
