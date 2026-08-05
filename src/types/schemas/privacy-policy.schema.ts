import { z } from "zod";

export const privacyPolicyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  // scope: z
  //   .enum(["loyalty", "gift_card", "pos", "subscription", "general"], {
  //     required_error: "Scope is required",
  //     invalid_type_error: "Invalid scope value",
  //   })
  //   .optional(),
  //
  // audience: z
  //   .enum(["customer", "restaurant", "employee"], {
  //     required_error: "Audience is required",
  //     invalid_type_error: "Invalid audience value",
  //   })
  //   .optional(),
  scope: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .enum(["loyalty", "gift_card", "pos", "subscription", "general"])
      .optional(),
  ),

  audience: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.enum(["customer", "restaurant", "employee"]).optional(),
  ),
});

export type PrivacyPolicyFormValues = z.infer<typeof privacyPolicyFormSchema>;
