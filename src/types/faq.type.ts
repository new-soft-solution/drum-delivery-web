export type FAQ = {
  id: string;
  question: string;
  answer: string;
  scope?: "loyalty" | "gift_card" | "pos" | "subscription" | "general";
  audience?: "employee" | "customer" | "restaurant";
  order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
};

export type FAQCreatePayload = Omit<
  FAQ,
  "id" | "order" | "created_at" | "updated_at"
>;
export type FAQUpdatePayload = Partial<FAQCreatePayload>;
export type FAQReorderItem = { id: number; order: number };
export interface FAQQueryParams {
  scope?: string;
  audience?: string;
  deleted?: string;
}
export type FAQResponse = {
  results: FAQ[];
  count: number;
  next: boolean;
  previous: boolean;
};
