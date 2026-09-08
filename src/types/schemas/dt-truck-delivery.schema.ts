import { z } from "zod";

export const dtTruckDeliveryFormSchema = z.object({
  shipment_id: z.string().min(1, "Shipment is required"),
  truck_number: z.string().min(1, "Truck number is required"),
  license_plate: z.string().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  scheduled_at: z.string().min(1, "Scheduled date & time is required"),
  status: z
    .enum(["Scheduled", "In Transit", "Delivered", "Overdue"])
    .optional(),
  notes: z.string().optional(),
});

export type DTTruckDeliveryFormValues = z.infer<
  typeof dtTruckDeliveryFormSchema
>;
