import { z } from "zod";

export const GroupSchema = z.object({
    name: z
        .string()
        .min(1, "Group name is required")
        .max(150, "Group name must be less than 150 characters"),

    permission_ids: z
        .array(
            z.number({
                required_error: "Permission ID must be a number",
                invalid_type_error: "Permission ID must be a valid number",
            }).int("Permission ID must be an integer")
        )
        .optional(),
    department_id: z.number().nullable().optional(),
    is_active: z.boolean().default(true),
});

export type GroupFormValues = z.infer<typeof GroupSchema>;
