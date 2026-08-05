import { z } from "zod";

export const contractFormSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().optional(),
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;
