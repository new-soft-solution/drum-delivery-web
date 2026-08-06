"use client";
import { ReactNode } from "react";
import { Card, CardBody, Button } from "react-bootstrap";
import { FileEdit, FileX, Save } from "lucide-react";
import styles from "./MyRestaurant.module.scss";
import { MyRestaurantSection } from "@/types/restaurant.type";

export const SectionWrapper = ({
  title,
  children,
  onSave,
  defaultEditable = false,
  section,
  handleToogleSectionEdit,
}: {
  title: string;
  children: ReactNode;
  onSave: () => void;
  defaultEditable?: boolean;
  section: MyRestaurantSection;
  handleToogleSectionEdit: (section: MyRestaurantSection) => void;
}) => {
  return (
    <Card className="mb-4">
      <CardBody>
        <div className={styles.sectionHeader}>
          <h5>{title}</h5>
          <Button
            variant="link"
            onClick={() => handleToogleSectionEdit(section)}
            className={styles.editButton}
          >
            {defaultEditable ? <FileX /> : <FileEdit />}
          </Button>
        </div>

        <div
          className={
            defaultEditable ? styles.editingSection : styles.viewSection
          }
        >
          {children}
        </div>

        {defaultEditable && (
          <div className={styles.saveSection}>
            <Button variant="primary" onClick={onSave}>
              <Save size={16} className="me-2" />
              Save Changes
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
