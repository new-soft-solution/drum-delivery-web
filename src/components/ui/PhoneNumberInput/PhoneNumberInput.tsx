"use client";

import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";
import PhoneInput, {
  isValidPhoneNumber,
  type Value,
} from "react-phone-number-input";
import type { CountryCode } from "libphonenumber-js/core";
import clsx from "clsx";
import styles from "./PhoneNumberInput.module.scss";
import "react-phone-number-input/style.css";
import { z } from "zod";

// required:
export const phoneNumberSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine((val) => isValidPhoneNumber(val), {
    message: "Invalid phone number",
  });

// optional:
export const optionalPhoneNumberSchema = z
  .string()
  .optional()
  .refine((val) => !val || isValidPhoneNumber(val), {
    message: "Invalid phone number",
  });

export type BasePhoneNumberInputProps = {
  /** Name for form libraries and accessibility */
  name: string;
  label?: string;
  /** E.164 string e.g. "+31612345678" or undefined */
  value?: Value;
  /** Optional handler; component will always pass a function to <PhoneInput/> */
  onChange?: (value: Value) => void;
  placeholder?: string;
  /** e.g. "NL", "US", "GB" */
  defaultCountry?: CountryCode;
  /** Whitelist of countries if needed */
  countries?: CountryCode[];
  disabled?: boolean;
  required?: boolean;
  /** Error message to display under the field */
  error?: string;
  /** Size hints to style the input via CSS module */
  size?: "sm" | "lg";
  /** Extra class on root wrapper if desired */
  className?: string;
  /** Extra class on Form.Group wrapper */
  containerClassName?: string;
  /** Helper text below the input (hidden if error shown) */
  helpText?: string;
  /** Autofocus underlying input */
  autoFocus?: boolean;
  /** Pass an id to associate label with input */
  id?: string;
};

const PhoneNumberInput = forwardRef<
  HTMLInputElement,
  BasePhoneNumberInputProps
>(
  (
    {
      name,
      label,
      value,
      onChange,
      placeholder = "Enter phone number",
      defaultCountry = "NL",
      countries,
      disabled,
      required,
      error,
      size,
      className,
      containerClassName,
      helpText,
      autoFocus,
      id,
    },
    ref
  ) => {
    const rootClass = clsx(
      styles.PhoneInputRoot,
      size === "sm" && styles.sm,
      size === "lg" && styles.lg,
      error && styles.invalid,
      className
    );

    const inputId = id ?? name;

    return (
      <Form.Group className={clsx("mb-3", containerClassName)}>
        {label && (
          <Form.Label htmlFor={inputId}>
            {label} {required && <span className="text-danger">*</span>}
          </Form.Label>
        )}

        <div className={styles.inputWrapper}>
          <PhoneInput
            className={rootClass}
            international
            countryCallingCodeEditable={false}
            defaultCountry={defaultCountry}
            countries={countries}
            value={value}
            // Always pass a function (satisfies TS), then proxy to optional handler.
            onChange={(v?: Value) => {
              onChange?.(v as Value);
            }}
            placeholder={placeholder}
            inputRef={ref}
            autoFocus={autoFocus}
            name={name}
            id={inputId}
            aria-invalid={!!error}
            disabled={disabled}
            required={required}
            inputMode="tel"
          />
        </div>

        {helpText && !error && (
          <Form.Text className="text-muted">{helpText}</Form.Text>
        )}
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </Form.Group>
    );
  }
);

PhoneNumberInput.displayName = "PhoneNumberInput";
export default PhoneNumberInput;

/** E.164 validator helper (true if empty or valid) */
export const validateE164 = (v?: string) => !v || isValidPhoneNumber(v);
