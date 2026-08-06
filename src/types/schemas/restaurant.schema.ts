// @/types/schemas/restaurant.schema.ts
import { phoneNumberSchema } from "@/components/ui/PhoneNumberInput/PhoneNumberInput";
import { restaurantStatusArray } from "@/constant/restaurant.constant";
import { z } from "zod";
import { isValidIbanChecksum } from "@/utils/DutchValidators";

const avatarSchema = z.instanceof(File).nullable().optional();

export const ownerSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone_number: z.string().optional().nullable().or(z.literal("")),
  avatar: avatarSchema,
  address: z.string().nullable().optional(),
});

export const restaurantFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),

  description: z.string().optional().nullable(),
  story: z.string().optional().nullable(),
  ambiance: z.string().optional().nullable(),

  phone_number: phoneNumberSchema,

  // API now has both `website` and sometimes `website_link`.
  // Accept empty/null (field is optional). Protocol is OPTIONAL — users can
  // enter a bare domain (findatable.nl), a www-prefixed domain, or a full
  // http(s) URL. We validate the hostname, then normalize on parse so the
  // value sent to the API is always an absolute https:// URL.
  website: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true;
        const candidate = /^https?:\/\//i.test(val) ? val : `https://${val}`;
        try {
          const u = new URL(candidate);
          if (u.protocol !== "http:" && u.protocol !== "https:") return false;
          const host = u.hostname;
          if (!host || !host.includes(".")) return false;
          // TLD sanity: last label must be 2+ letters (rejects trailing dot,
          // bare IPs, all-numeric TLDs, one-char TLDs).
          const tld = host.split(".").pop() ?? "";
          return /^[a-z]{2,}$/i.test(tld);
        } catch {
          return false;
        }
      },
      {
        message:
          "Enter a valid website (e.g. yourwebsite.com, www.yourwebsite.com, or https://yourwebsite.com)",
      },
    )
    .transform((val) => {
      if (!val) return val;
      return /^https?:\/\//i.test(val) ? val : `https://${val}`;
    }),
  website_link: z.string().optional().nullable(),

  // API may return null; UI sometimes uses empty string
  contact_email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  contact_email_verified: z.boolean().optional(),

  // Address (make street required based on your UI + API data)
  street_name: z.string().min(1, "Street name is required"),
  house_number: z.string().min(1, "House number is required"),
  /* Optional Dutch toevoeging / huisletter (e.g. "A", "bis"). UI-only —
     combined into the canonical `house_number` (e.g. "128A") at submit time.
     Kept as a separate form field so the split UI has a clean home and the
     schema does not force parsing/round-tripping in the render loop. */
  addition: z.string().optional().default(""),
  city: z.string().min(2, "City must be at least 2 characters"),
  neighborhood: z.string().optional().nullable(),
  postal_code: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(1, "Country is required"),

  // status / toggles
  status: z.enum(restaurantStatusArray).optional(),
  is_featured: z.boolean().optional(),
  allows_walk_ins: z.boolean().optional(),
  manual_booking_approval: z.boolean().optional(),
  is_active: z.boolean().optional(),

  price_range: z.string().optional(),

  // booking policies
  min_booking_notice_hours: z.number().min(1).max(24).optional(),
  max_booking_notice_days: z.number().min(1).max(365).optional(),
  cancellation_policy_hours: z.number().min(1).max(168).optional(),

  // map
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),

  // tags
  tags_ids: z.array(z.number().int()).optional(),

  // business
  kvk_number: z
    .string({ required_error: "KVK number is required" })
    .trim()
    .min(1, "KVK number is required")
    .refine((val) => /^\d{8}$/.test(val.replace(/\s+/g, "")), {
      message:
        "Invalid KVK number. A KVK number must be exactly 8 digits (e.g. 12345678)",
    }),

  btw: z
    .string({ required_error: "BTW (VAT) is required" })
    .trim()
    .min(1, "BTW (VAT) is required")
    .refine(
      (val) => {
        const raw = val.replace(/\s+/g, "").toUpperCase();
        return /^NL\d{9}B\d{2}$/.test(raw);
      },
      { message: "Invalid BTW format. Example: NL123456789B01" },
    ),
  iban: z
    .string({ required_error: "IBAN is required" })
    .trim()
    .min(1, "IBAN is required")
    .refine(
      (val) => {
        const raw = val.replace(/\s+/g, "").toUpperCase();
        return /^NL\d{2}[A-Z]{4}\d{10}$/.test(raw);
      },
      {
        message: "Invalid IBAN format. Example: NL91ABNA0417164300",
      },
    )
    .refine((val) => isValidIbanChecksum(val), {
      message: "Invalid Dutch IBAN checksum.",
    }),
  // Registered legal entity name (separate from public/brand `name`).
  // Optional — backend silently ignores it for restaurant owners.
  legal_entity_name: z.string().trim().optional().nullable(),
  owner: ownerSchema,
  dress_code: z.string().optional(),
});

export const restaurantFormFileSchema = z.object({
  verification_documents: z
    .array(z.instanceof(File))
    .min(1, "At least one verification document is required"),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema> &
  z.infer<typeof restaurantFormFileSchema>;

export const defaultEditableFields = {
  basic: false,
  contact: false,
  address: false,
};

export const basicInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
});

export const contactInfoSchema = z.object({
  phone_number: phoneNumberSchema,
  contact_email: z.string().email("Invalid email address"),
});

export const addressSchema = z.object({
  address_line1: z.string().min(1, "Address line 1 is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

export const myRestaurantSchema = basicInfoSchema
  .merge(contactInfoSchema)
  .merge(addressSchema);
