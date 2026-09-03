import { z } from "zod";

export const dtSiteFormSchema = z.object({
  name: z.string().min(1, "Site name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
});

export type DTSiteFormValues = z.infer<typeof dtSiteFormSchema>;
