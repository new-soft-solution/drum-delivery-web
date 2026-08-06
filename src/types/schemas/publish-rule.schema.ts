import { z } from "zod";

export const publishRuleFormSchema = z.object({
  key: z.string().min(1, "Key is required"),
  label: z.string().min(1, "Label is required"),
  description: z.string().optional(),
  url: z.string().optional(),

  countable: z.boolean().optional(),
  is_required: z.boolean().optional(),

  // keep as number; UI can coerce with valueAsNumber
  min_count: z.coerce.number().int().nonnegative().optional(),

  order: z.coerce.number().int().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

export type PublishRuleFormValues = z.infer<typeof publishRuleFormSchema>;
