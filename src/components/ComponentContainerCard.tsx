import type { ComponentContainerProps } from "@/types/component-props.type";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";

const ComponentContainerCard = ({
  title,
  children,
}: ComponentContainerProps) => {
  return (
    <Card>
      <CardHeader>
        <Row className="align-items-center">
          <Col>
            <div className="d-flex justify-content-between items-aligin-center">
              <CardTitle as="h4">{title}</CardTitle>
            </div>
          </Col>
        </Row>
      </CardHeader>
      <CardBody className="pt-0">
        <>{children}</>
      </CardBody>
    </Card>
  );
};

export default ComponentContainerCard;
