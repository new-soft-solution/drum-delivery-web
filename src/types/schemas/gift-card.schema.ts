import { z } from "zod";
import { GiftCardOrder } from "../gift-card-order.type";

/** -----------------------------
 * Zod schema aligned to order data
 * ----------------------------- */
export const money = z.coerce.number().min(0, "Amount cannot be negative");

export const schema = z.object({
  // Meta & status
  status: z.string().min(1, "Status is required"),
  payment_status: z.string().min(1, "Payment status is required"),
  payment_method: z.string().min(1, "Payment method is required"),
  transaction_id: z.string().optional().or(z.literal("").optional()),
  payment_date: z.string().optional().or(z.literal("").optional()),

  // Totals
  total_amount: money,
  discount_amount: money.default(0),
  tax_amount: money.default(0),
  grand_total: money,

  // Delivery
  delivery_date: z.string().optional().or(z.literal("").optional()),
  delivery_notes: z.string().optional().or(z.literal("").optional()),

  // Address (admin can leave blank)
  street_name: z.string().optional().or(z.literal("").optional()),
  house_number: z.string().optional().or(z.literal("").optional()),
  house_number_suffix: z.string().optional().or(z.literal("").optional()),
  postal_code: z.string().optional().or(z.literal("").optional()),
  city: z.string().optional().or(z.literal("").optional()),
  country: z.string().optional().or(z.literal("").optional()),

  // Recipient
  recipient_name: z.string().optional().or(z.literal("").optional()),
  recipient_email: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").optional()),

  // Sender
  sender_full_name: z.string().min(1, "Sender full name is required"),
  sender_email: z.string().email("Enter a valid email"),
  sender_phone: z.string().min(1, "Sender phone is required"),
});

export type FormValues = z.infer<typeof schema>;

export interface GiftCardOrderFormProps {
  item?: GiftCardOrder;
  onCancel: () => void;
  onSuccess: () => void;
}
