import { z } from "zod";

export const shipmentSiteSchema = z.object({
  site: z.string().min(1, "Destination site is required"),
  drums: z.array(z.string()),
});

export const shipmentFormSchema = z.object({
  invoice_no: z.string().min(1, "Invoice number is required").max(50),
  bl_no: z.string().min(1, "B/L number is required").max(50),
  sites: z
    .array(shipmentSiteSchema)
    .min(1, "At least one destination site is required")
    .superRefine((sites, ctx) => {
      const seenSites = new Set<string>();
      const seenDrums = new Set<string>();
      sites.forEach((row, i) => {
        if (row.site) {
          if (seenSites.has(row.site)) {
            ctx.addIssue({
              code: "custom",
              path: [i, "site"],
              message: "This site is already added",
            });
          }
          seenSites.add(row.site);
        }
        if (row.drums.some((d) => seenDrums.has(d))) {
          ctx.addIssue({
            code: "custom",
            path: [i, "drums"],
            message: "A drum can only be assigned to one site",
          });
        }
        row.drums.forEach((d) => seenDrums.add(d));
      });
    }),
  expected_arrival_date: z.string().optional().or(z.literal("")),
  status: z
    .enum(["CREATED", "IN_TRANSIT", "ARRIVED", "DELIVERED", "CANCELLED"])
    .optional(),
  is_active: z.boolean().optional(),
  orders: z.array(z.string()).optional(),
});

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;
