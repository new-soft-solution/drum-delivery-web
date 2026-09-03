// src/types/schemas/drum.schema.ts
import { z } from "zod";

// Matches the backend's DecimalField pattern exactly: up to 7 digits before
// the decimal point, up to 3 after, optionally negative.
const decimalString = z
  .string()
  .min(1, "Required")
  .regex(
    /^-?\d{0,7}(?:\.\d{0,3})?$/,
    "Enter a valid number (up to 3 decimal places)",
  );

export const drumFormSchema = z.object({
  drum_number: z.string().min(1, "Drum number is required").max(50),
  length_kms: decimalString,
  net_weight_mt: decimalString,
  gross_weight_mt: decimalString,
  status: z
    .enum([
      "AVAILABLE",
      "IN_ORDER",
      "IN_SHIPMENT",
      "DELIVERED",
      "MISSING",
      "DAMAGED",
    ])
    .optional(),
  container_no: z.string().max(50).optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export type DrumFormValues = z.infer<typeof drumFormSchema>;
