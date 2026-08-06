import { z } from "zod";

export const amenityFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type AmenityFormValues = z.infer<typeof amenityFormSchema>;
