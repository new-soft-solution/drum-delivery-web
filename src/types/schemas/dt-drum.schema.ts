import { z } from "zod";

export const dtDrumFormSchema = z.object({
  drum_number: z.string().min(1, "Drum number is required"),
  container_number: z.string().min(1, "Container number is required"),
  length_km: z.coerce.number().positive("Length must be greater than 0"),
  net_weight_mt: z.coerce.number().positive("Net weight must be greater than 0"),
  gross_weight_mt: z.coerce.number().positive("Gross weight must be greater than 0"),
  status: z.enum(["Available", "In Transit", "Missing"]).optional(),
  notes: z.string().optional(),
});

export type DTDrumFormValues = z.infer<typeof dtDrumFormSchema>;
