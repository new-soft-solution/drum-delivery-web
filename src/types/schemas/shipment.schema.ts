import { z } from "zod";

export const shipmentFormSchema = z.object({
  invoice_no: z.string().min(1, "Invoice number is required").max(50),
  bl_no: z.string().min(1, "B/L number is required").max(50),
  destination_site: z.string().min(1, "Destination site is required"),
  expected_arrival_date: z.string().optional().or(z.literal("")),
  status: z
    .enum(["CREATED", "IN_TRANSIT", "ARRIVED", "DELIVERED", "CANCELLED"])
    .optional(),
  is_active: z.boolean().optional(),
  drums: z.array(z.string()).optional(),
  orders: z.array(z.string()).optional(),
});

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;
