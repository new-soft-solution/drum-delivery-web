import {z} from "zod";

export const PlanTypeSchema = z.object({
    code: z
        .string()
        .min(1, "Code is required")
        .max(50, "Code cannot exceed 50 characters"),

    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name cannot exceed 100 characters"),

    description: z
        .string()
        .nullable()
        .optional(),
});

export type PlanTypeFormValues = z.infer<typeof PlanTypeSchema>;
