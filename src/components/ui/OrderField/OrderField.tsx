"use client";

import React from "react";
import { Form, Row, Col } from "react-bootstrap";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import styles from "./OrderField.module.scss";

type OrderFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label?: string;
  helpText?: string;

  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;

  disabled?: boolean;
};

export function OrderField<TFieldValues extends FieldValues>({
  control,
  name,
  label = "Order",
  min = 0,
  max = 10000,
  step = 1,
  defaultValue = 0,
  disabled = false,
}: OrderFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      defaultValue={defaultValue as never}
      render={({ field, fieldState }) => {
        const valueNum =
          typeof field.value === "number" && Number.isFinite(field.value)
            ? field.value
            : defaultValue;

        return (
          <Form.Group className="mb-0">
            <div className={styles.header}>
              <Form.Label className="mb-0">{label}</Form.Label>
            </div>

            <Row className="g-2 align-items-center">
              <Col xs={3}>
                <Form.Control
                  type="number"
                  value={valueNum}
                  className={styles.numberInput}
                  min={min}
                  max={max}
                  step={step}
                  disabled={disabled}
                  isInvalid={!!fieldState.error}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                />
              </Col>
              <Col xs={9}>
                <Form.Range
                  value={valueNum}
                  min={min}
                  max={max}
                  step={step}
                  disabled={disabled}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                />
              </Col>
              <Form.Control.Feedback type="invalid">
                {fieldState.error?.message}
              </Form.Control.Feedback>

              {/* <Col xs={12}>
                <div className={styles.meta}>
                  <div className="text-muted small">
                    Min: <b>{min}</b> • Max: <b>{max}</b> • Step: <b>{step}</b>
                  </div>
                </div>
              </Col> */}
            </Row>
          </Form.Group>
        );
      }}
    />
  );
}

export default OrderField;
