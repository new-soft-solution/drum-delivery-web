import { z } from "zod";

// Define display locations as key-value pairs
export const displayLocationOptions = {
  HOMEPAGE_HEADER: "homepage__header",
  HOMEPAGE_SIDEBAR: "homepage__sidebar",
  HOMEPAGE_FOOTER: "homepage__footer",
  HOMEPAGE_MAIN: "homepage__main",
  HOMEPAGE_SECTION_1: "homepage__section_1",
  HOMEPAGE_SECTION_2: "homepage__section_2",
  HOMEPAGE_SECTION_3: "homepage__section_3",
  HOMEPAGE_SECTION_4: "homepage__section_4",
  HOMEPAGE_SECTION_5: "homepage__section_5",
  HOMEPAGE_SECTION_6: "homepage__section_6",
  PRODUCT_PAGE_HEADER: "product_page__header",
  PRODUCT_PAGE_SIDEBAR: "product_page__sidebar",
  PRODUCT_PAGE_FOOTER: "product_page__footer",
  CATEGORY_PAGE_HEADER: "category_page__header",
  CATEGORY_PAGE_SIDEBAR: "category_page__sidebar",
  CATEGORY_PAGE_FOOTER: "category_page__footer",
  POPUP_MAIN: "popup__main",
} as const;

export function formatDisplayLocation(key: string): string {
  return key
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export type DisplayLocation =
  (typeof displayLocationOptions)[keyof typeof displayLocationOptions];

const displayLocationValues = Object.values(displayLocationOptions) as [
  DisplayLocation,
  ...DisplayLocation[],
];

const statusOptions = ["Active", "Inactive", "Expired"] as const;

export const bannerFormSchema = z
  .object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    image: z.string().optional(),
    call_to_action_link: z.string().optional(),
    call_to_action_text: z.string().optional(),
    show_call_to_action: z.boolean().default(false),
    description: z.string().optional(),
    status: z.enum(statusOptions),
    display_order: z.number().int().min(0),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    display_location: z.enum(displayLocationValues),
  })
  .superRefine((v, ctx) => {
    if (v.start_date && v.end_date && v.start_date > v.end_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "End date must be on or after the start date.",
      });
    }
  });

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
