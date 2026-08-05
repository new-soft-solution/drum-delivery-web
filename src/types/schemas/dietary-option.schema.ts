import { z } from "zod";

export const dietaryOptionFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
});

export type DietaryOptionFormValues = z.infer<typeof dietaryOptionFormSchema>;
