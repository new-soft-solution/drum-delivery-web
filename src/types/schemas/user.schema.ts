import { z } from "zod";

const usernamePattern = /^[\w.@+-]+$/;

export const userFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(254),
  username: z
    .string()
    .min(1, "Username is required")
    .max(150)
    .regex(usernamePattern, "Letters, digits and @/./+/-/_ only"),
  first_name: z.string().max(150).optional().or(z.literal("")),
  last_name: z.string().max(150).optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
