import { z } from "zod";

export const PlanSchema = z.object({
  plan_type_id: z
    .number({
      required_error: "Plan type is required",
    })
    .int(),

  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code cannot exceed 50 characters"),

  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters"),

  description: z.string().nullable().optional(),

  base_price: z.string().regex(/^\d{1,8}(?:\.\d{1,2})?$/, {
    message: "Invalid price format. Example: 199.99",
  }),
  per_cover_charge: z.string().regex(/^\d{1,8}(?:\.\d{1,2})?$/, {
    message: "Invalid charge format. Example: 199.99",
  }),

  duration_months: z
    .number()
    .min(0, "Duration cannot be negative")
    .max(2147483647, "Duration is too large")
    .int(),
  level: z
    .number()
    .min(0, "Level cannot be negative")
    .max(2147483647, "Level is too large")
    .int(),
  max_devices: z
    .number({
      required_error: "Max devices is required",
      invalid_type_error: "Max devices must be a number",
    })
    .int("Max devices must be an integer")
    .min(1, "Minimum 1 device allowed")
    .max(2147483647, "Value is too large"),
  tagline: z
    .string()
    .max(255, "Tagline cannot exceed 255 characters")
    .nullable()
    .optional(),
  cta_label: z
    .string()
    .max(50, "CTA label cannot exceed 50 characters")
    .nullable()
    .optional(),
  is_most_popular: z.boolean().optional().default(false),
  yearly_discount_months: z
    .number({
      invalid_type_error: "Yearly discount months must be a number",
    })
    .int("Yearly discount months must be an integer")
    .min(0, "Cannot be negative")
    .max(12, "Cannot exceed 12 months")
    .optional()
    .default(0),
  is_active: z.boolean().optional().default(true),
  feature_ids: z.array(z.number().int()).optional(),
});

export type PlanFormValues = z.infer<typeof PlanSchema>;
