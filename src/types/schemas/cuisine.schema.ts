import { z } from "zod";

export const cuisineFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  is_popular: z.boolean().optional(),
  is_active: z.boolean().optional(),
});
export const activeFormSchema = z.object({
  is_active: z.boolean().optional(),
});

export type CuisineFormValues = z.infer<typeof cuisineFormSchema>;
export type ActiveFormValues = z.infer<typeof activeFormSchema>;
