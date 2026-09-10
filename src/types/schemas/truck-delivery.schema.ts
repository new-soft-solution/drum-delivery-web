import { z } from "zod";

export const truckDeliveryFormSchema = z.object({
  truck_number: z.string().min(1, "Truck number is required").max(20),
  shipment: z.string().min(1, "Shipment is required"),
  driver_name: z.string().max(100).optional().or(z.literal("")),
  driver_phone: z.string().max(20).optional().or(z.literal("")),
  license_plate: z.string().max(15).optional().or(z.literal("")),
  scheduled_date: z.string().optional().or(z.literal("")),
  actual_departure_date: z.string().optional().or(z.literal("")),
  actual_arrival_date: z.string().optional().or(z.literal("")),
  status: z
    .enum(["SCHEDULED", "IN_TRANSIT", "DELIVERED", "CANCELLED"])
    .optional(),
  notes: z.string().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
});

export type TruckDeliveryFormValues = z.infer<typeof truckDeliveryFormSchema>;
