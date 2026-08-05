import {z} from "zod";

export const RestaurantTableSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(255, "Name cannot be more than 255 characters"),

    capacity: z
        .number({
            invalid_type_error: "Capacity must be a number",
        })
        .int("Capacity must be an integer")
        .min(-2147483648, "Capacity is too small")
        .max(2147483647, "Capacity is too large"),

    status: z.enum(["available", "occupied", "reserved"], {
        required_error: "Status is required",
    }),

    is_active: z.boolean().default(true),
});

export type TableFormValues = z.infer<typeof RestaurantTableSchema>;
