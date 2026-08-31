import { z } from "zod";

export const orderFormSchema = z.object({
  client: z.string().min(1, "Client is required"),
  description: z.string().max(500).optional().or(z.literal("")),
  quantity: z.coerce.number().int().optional(),
  unit: z.string().max(20).optional().or(z.literal("")),
  status: z.enum(["CREATED", "ASSIGNED_TO_SHIPMENT", "COMPLETED", "CANCELLED"]).optional(),
  is_active: z.boolean().optional(),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;
