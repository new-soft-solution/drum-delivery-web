import { z } from "zod";

const decimalString = z
  .string()
  .min(1, "Required")
  .regex(
    /^\d{0,7}(?:\.\d{0,3})?$/,
    "Enter a valid positive number (up to 3 decimal places)",
  );

/**
 * The plain object shape, with no cross-field refinement — kept separate
 * (and exported) purely so `.pick()` still works for the trimmed
 * quick-create forms elsewhere. Zod's `.refine()` replaces a ZodObject
 * with a ZodEffects, which drops `.pick()`/`.extend()`; picking from this
 * base first, then wrapping the result in `withGrossWeightCheck` below,
 * is how those forms get the same validation without losing `.pick()`.
 */
export const drumFormBaseSchema = z.object({
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

/**
 * The real backend rejects gross_weight_mt < net_weight_mt with a
 * non_field_errors validation error ("Gross weight cannot be less than net
 * weight."). Mirrored here — same wording — so the mistake is caught
 * client-side, attached to the Gross Weight field, before ever hitting
 * the API.
 */
export const withGrossWeightCheck = <
  Shape extends { net_weight_mt: z.ZodTypeAny; gross_weight_mt: z.ZodTypeAny },
>(
  schema: z.ZodObject<Shape>,
) =>
  schema.refine(
    (data) => {
      const net = Number((data as { net_weight_mt: string }).net_weight_mt);
      const gross = Number(
        (data as { gross_weight_mt: string }).gross_weight_mt,
      );
      if (Number.isNaN(net) || Number.isNaN(gross)) return true;
      return gross >= net;
    },
    {
      message: "Gross weight cannot be less than net weight.",
      path: ["gross_weight_mt"],
    },
  );

// The schema everywhere else in the app imports — refined, so it already
// includes the gross >= net check; no wrapping needed at the call site.
export const drumFormSchema = withGrossWeightCheck(drumFormBaseSchema);

export type DrumFormValues = z.infer<typeof drumFormSchema>;
