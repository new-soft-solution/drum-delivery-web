import { z } from "zod";

export const ReplySchema = z.object({
  rating_id: z.number(),

  reply_text: z.string().min(1, "Reply text is required"),

  // is_active: z.boolean().optional().default(true),
});

export type ReplyFormValues = z.infer<typeof ReplySchema>;
