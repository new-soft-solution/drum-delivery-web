import { z } from "zod";

export const SubscriptionRequestSchema = z.object({
  target_plan_id: z
    .number({
      required_error: "Plan id is required",
    })
    .int(),
  restaurant_id: z
    .number({
      required_error: "Plan id is required",
    })
    .int(),
  status: z.string(),
});

export type SubscriptionRequestFormValues = z.infer<
  typeof SubscriptionRequestSchema
>;
