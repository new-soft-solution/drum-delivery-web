import { z } from "zod";
import {
  isAtLeast18,
  isDutchIbanFormat,
  isValidDutchPhone,
  isValidIbanChecksum,
} from "@/utils/DutchValidators";

// const nlPhoneRegex = /^(\+31[1-9][0-9]{8}|06[1-9][0-9]{7})$/;

export const EmployeeSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(255, "First name is too long")
    .regex(/^[A-Za-z ]+$/, "Only letters and spaces allowed"),

  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(255, "Last name is too long")
    .regex(/^[A-Za-z ]+$/, "Only letters and spaces allowed"),

  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Invalid email format"),

  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .max(20)
    .refine((val) => isValidDutchPhone(val), {
      message:
        "Phone number must be a valid Dutch number (e.g. +31 6 12345678, +31 20 1234567).",
    }),

  group_id: z.number().nullable().optional(),

  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date",
    })
    .refine((val) => new Date(val) <= new Date(), {
      message: "Date of birth cannot be in the future",
    })
    .refine((val) => isAtLeast18(val), {
      message: "The staff must be at least 18 years old.",
    }),

  iban: z
    .string()
    .refine((val) => isDutchIbanFormat(val), {
      message:
        "Dutch IBAN must be in the format: NLkkBBBB########## (e.g. NL91ABNA0417164300).",
    })
    .refine((val) => isValidIbanChecksum(val), {
      message: "Invalid Dutch IBAN checksum.",
    }),

  is_active: z.boolean().default(true),
});

export type EmployeeFormValues = z.infer<typeof EmployeeSchema>;
