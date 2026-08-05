import { z } from "zod";

export const faqSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(500, "Question too long"),

  scope: z
    .enum(["loyalty", "gift_card", "pos", "subscription", "general"], {
      required_error: "Scope is required",
      invalid_type_error: "Invalid scope value",
    })
    .optional(),

  audience: z
    .enum(["customer", "restaurant", "employee"], {
      required_error: "Audience is required",
      invalid_type_error: "Invalid audience value",
    })
    .optional(),

  answer: z.string().min(1, "Answer is required").max(1000, "Answer too long"),
});

export type FAQFormValues = z.infer<typeof faqSchema>;
