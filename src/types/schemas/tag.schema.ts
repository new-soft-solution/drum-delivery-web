import {z} from "zod";

export const TagSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),

    color: z
        .string()
        .min(1, "Color is required")
        .max(7, "Color must be a valid hex color")
        .regex(/^#([A-Fa-f0-9]{6})$/, "Invalid hex color code"),

    is_active: z.boolean().default(true),
});

export type TagFormValues = z.infer<typeof TagSchema>;
