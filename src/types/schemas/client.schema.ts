import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().min(1, "Client name is required").max(100),
  email: z.string().min(1, "Email is required").email("Enter a valid email").max(100),
  contact_person: z.string().min(1, "Contact person is required").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  postal_code: z.string().max(20).optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
