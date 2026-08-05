import { z } from "zod";

export const DepartmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Department name must be less than 150 characters"),
  scope_id: z
    .number({
      required_error: "Scope ID is required",
      invalid_type_error: "Scope ID must be a valid number",
    })
    .int("Scope ID must be an integer"),
});

export type DepartmentFormValues = z.infer<typeof DepartmentSchema>;
