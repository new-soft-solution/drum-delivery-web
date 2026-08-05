import { z } from "zod";

export const ScopeSchema = z.object({
    name: z
        .string()
        .min(1, "Scope name is required")
        .max(150, "Scope name must be less than 150 characters"),

    permission_ids: z
        .array(
            z.number({
                required_error: "Permission ID must be a number",
                invalid_type_error: "Permission ID must be a valid number",
            }).int("Permission ID must be an integer")
        )
        .optional(),

    is_active: z.boolean().default(true),
});

export type ScopeFormValues = z.infer<typeof ScopeSchema>;
