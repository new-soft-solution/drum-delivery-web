import { z } from "zod";

export const siteFormSchema = z.object({
  name: z.string().min(1, "Site name is required").max(100),
  address: z.string().min(1, "Address is required").max(255),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(100).optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
  postal_code: z.string().max(20).optional().or(z.literal("")),
  contact_person: z.string().max(100).optional().or(z.literal("")),
  contact_phone: z.string().max(20).optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export type SiteFormValues = z.infer<typeof siteFormSchema>;
