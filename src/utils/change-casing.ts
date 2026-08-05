export const snakeToTitleCase = (value: string | null | undefined) => {
  if (!value) return "";
  return value
    .split("_")
    .filter((x) => x.length > 0)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
};

export const kebabToTitleCase = (value: string | null | undefined) => {
  if (!value) return "";
  return value
    .split("-")
    .filter((x) => x.length > 0)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
};

export const toSentenceCase = (value: string | null | undefined) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const toAlphaNumber = (n: number) => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + "K";
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + "M";
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + "B";
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + "T";
};

export function formatGiftCardNumber(cardNumber: string | number) {
  if (!cardNumber) return "-";

  // Remove any existing spaces and non-digit characters
  const cleaned = cardNumber.toString().replace(/\D/g, "");

  // Add space every 4 characters
  return cleaned.replace(/(.{4})/g, "$1 ").trim();
}
