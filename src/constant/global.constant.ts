type CurrencyType = "₹" | "$" | "€";

export const currency: CurrencyType = "$";

export const currentYear = new Date().getFullYear();

export const developedByLink = "https://mannatthemes.com/";

export const developedBy = "Mannatthemes";

export const contactUs = "support@mannatthemes.com";

export const buyLink = "";

export const basePath = "/fat-admin";

export const REST_ADMIN_ROLE = "restaurant_admin";
export const SUPER_ADMIN_ROLE = "superadmin";

export const DEFAULT_PAGE_TITLE = "Find A Table | Admin & Dashboard";

export const colorVariants = [
  "primary",
  "secondary",
  "success",
  "warning",
  "info",
  "danger",
  "dark",
  "light",
];

export const SPINNER_DEFAULT_CLASS =
  "d-flex justify-content-center align-items-center vh-50";

export const TimeZone = "Europe/Amsterdam";

// --- Money display (UI-only) ---
export const money = (v?: string | number | null) => {
  const n = typeof v === "number" ? v : v ? parseFloat(String(v)) : 0;
  if (!Number.isFinite(n)) return "€0.00";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(n);
};
