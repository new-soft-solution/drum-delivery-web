import { z } from "zod";

export const ParameterRatingsSlimSchema = z.object({
  parameter_id: z.number(),
  rating: z.number().min(1).max(5),
});

export const RatingSchema = z.object({
  reservation_id: z.number(),

  rating_remarks: z.string().optional(),

  parameter_ratings: z
    .array(ParameterRatingsSlimSchema)
    .min(1, "At least one parameter rating is required"),

  images: z
    .array(
      z.instanceof(File, {
        message: "Image must be a file",
      }),
    )
    .optional(),

  is_active: z.boolean().default(true),
});
export const RatingStatusSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
});

export type RatingFormValues = z.infer<typeof RatingSchema>;
export type RatingStatusValues = z.infer<typeof RatingStatusSchema>;
