"use client";

import React from "react";
import {
  Controller,
  Path,
  type Control,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";
import PhoneNumberInput, {
  type BasePhoneNumberInputProps,
  validateE164,
} from "./PhoneNumberInput";
import type { Value } from "react-phone-number-input";

/**
 * Convert any raw string into an "international-shaped" value:
 * - keep only digits and an optional leading '+'
 * - if there's no leading '+', prefix one
 * This does NOT assume a country; it simply ensures a '+'-prefixed value.
 */
function coerceToIntlShape(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const s = raw.trim();
  if (!s) return undefined;

  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return "+";
  return `+${digits}`;
}

type RHFPhoneNumberInputProps<TFieldValues extends FieldValues> = Omit<
  BasePhoneNumberInputProps,
  "value" | "onChange" | "name" | "error"
> & {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
};

function RHFPhoneNumberInput<TFieldValues extends FieldValues>({
  name,
  control,
  rules,
  ...rest
}: RHFPhoneNumberInputProps<TFieldValues>) {
  // Compose validation without using setValueAs (Controller omits it in its type)
  const mergedRules:
    | RegisterOptions<TFieldValues, Path<TFieldValues>>
    | undefined = {
    // If caller provided validate, keep theirs; otherwise use our E.164 validator
    ...rules,
    validate:
      rules?.validate ??
      ((v: unknown) =>
        validateE164(typeof v === "string" ? v : undefined) ||
        "Invalid phone number"),
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={mergedRules}
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        // Ensure the controlled component always receives a '+'-prefixed (intl-shaped) value or undefined.
        const displayValue = coerceToIntlShape(value) as Value | undefined;

        // Keep intl-shaped value in form state as the user types (no country assumption).
        const handleChange = (v?: Value) => {
          const shaped = coerceToIntlShape(v ?? value);
          onChange(shaped ?? v ?? undefined);
        };

        return (
          <PhoneNumberInput
            {...rest}
            // Do NOT pass defaultCountry if you want zero country assumptions.
            name={name}
            value={displayValue}
            onChange={handleChange as (v: Value) => void}
            error={error?.message}
          />
        );
      }}
    />
  );
}

export default RHFPhoneNumberInput;
