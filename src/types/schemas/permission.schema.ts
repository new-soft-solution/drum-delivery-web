import {z} from "zod";

export const PermissionSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(255, "Name must be less than 255 characters"),

    codename: z
        .string()
        .min(1, "Codename is required")
        .max(100, "Codename must be less than 100 characters"),

    content_type_id: z
        .number({
            required_error: "Content Type ID is required",
            invalid_type_error: "Content Type ID must be a number",
        })
        .int("Content Type ID must be an integer"),

    is_active: z.boolean().default(true),
});

export type PermissionFormValues = z.infer<typeof PermissionSchema>;
