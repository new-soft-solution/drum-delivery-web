import { z } from "zod";

export const dtShipmentFormSchema = z.object({
  shipment_number: z.string().optional(),
  invoice_number: z.string().optional(),
  bl_number: z.string().optional(),
  container_number: z.string().optional(),
  destination_site_id: z.coerce.number().min(1, "Destination site is required"),
  expected_arrival: z.string().min(1, "Expected arrival date is required"),
  status: z.enum(["Created", "In Transit", "Arrived", "Delivered"]).optional(),
});

export type DTShipmentFormValues = z.infer<typeof dtShipmentFormSchema>;
