"use client";
import { Form } from "react-bootstrap";
import styles from "./MyRestaurant.module.scss";
import { UseFormRegister, FieldValues, Path } from "react-hook-form";

type EditableFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue: any;
  isEditing: boolean;
  type?: string;
  as?: React.ElementType;
};

export const EditableField = <T extends FieldValues>({
  label,
  name,
  register,
  defaultValue,
  isEditing,
  type = "text",
  as = "input",
}: EditableFieldProps<T>) => {
  return (
    <div className={styles.fieldGroup}>
      <Form.Label>{label}</Form.Label>
      {isEditing ? (
        <Form.Control
          as={as}
          type={type}
          {...register(name)}
          defaultValue={defaultValue || ""}
        />
      ) : (
        <div className={styles.fieldValue}>
          {defaultValue || `No ${label.toLowerCase()} provided`}
        </div>
      )}
    </div>
  );
};
