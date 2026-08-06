import { z } from "zod";

export const dtOrderFormSchema = z.object({
  po_number: z.string().min(1, "P.O number is required"),
  client_id: z.coerce.number().min(1, "Client is required"),
  description: z.string().optional(),
  status: z.enum(["Created", "Assigned", "Completed"]).optional(),
});

export type DTOrderFormValues = z.infer<typeof dtOrderFormSchema>;
