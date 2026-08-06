import { z } from "zod";

export const dtClientFormSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  contact_person: z.string().min(1, "Contact person is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

export type DTClientFormValues = z.infer<typeof dtClientFormSchema>;
