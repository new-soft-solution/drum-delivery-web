import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TimeZone } from "@/constant/global.constant";

dayjs.extend(utc);
dayjs.extend(timezone);

// Default to Netherlands time
const DEFAULT_TZ = "Europe/Amsterdam";

/**
 * Format a date in NL/EU style.
 *
 * dd-mm-yyyy  -> e.g. 10-01-2025
 * dd-mm-yyyy HH:mm -> e.g. 10-01-2025 16:30 (when time: true)
 *
 * @param date string | Date
 * @param opts optional { time?: boolean; tz?: string }
 */
export const formatDateNL = (
  date: string | Date,
  opts: { time?: boolean; tz?: string } = {},
): string => {
  const { time = false, tz = DEFAULT_TZ } = opts;

  const d = dayjs(date).tz(tz);
  if (!d.isValid()) return "";

  return d.format(time ? "DD-MM-YYYY hh:mm" : "DD-MM-YYYY");
};

export const formatDateTimeWithCharsNL = (date: string | Date) => {
  return dayjs(date).format("MMM DD, YYYY hh:mm");
};
export const formatDateNLAMPM = (date: string | Date) => {
  return dayjs(date).format("DD-MM-YYYY hh:mm a");
};
export const formatDateNLAMPMSS = (date: string | Date) => {
  return dayjs(date).format("DD-MM-YYYY hh:mm:ss");
};
// API ISO (any tz) -> Date in TZ for intermediate conversion
export const isoToDateInTZ = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = dayjs(iso).tz(TimeZone);
  return d.isValid() ? d.toDate() : null;
};

// Date -> ISO (UTC) for API (payment_date)
export const dateToISOUtc = (d: Date | null | undefined): string | null =>
  d ? dayjs(d).utc().toISOString() : null;

// Date -> YYYY-MM-DD in NL tz (delivery_date)
export const dateToYMD_NL = (d: Date | null | undefined): string | null =>
  d ? dayjs(d).tz(TimeZone).format("YYYY-MM-DD") : null;

export const formatNotificationDateTime = (
  date: string | Date,
  opts: { tz?: string } = {},
): string => {
  const { tz = DEFAULT_TZ } = opts;

  const d = dayjs(date).tz(tz);
  if (!d.isValid()) return "";

  const now = dayjs().tz(tz);

  if (d.isSame(now, "day")) {
    // Today → "Today 14:30"
    return `Today ${d.format("HH:mm")}`;
  }

  if (d.isSame(now.subtract(1, "day"), "day")) {
    // Yesterday → "Yesterday 09:15"
    return `Yesterday ${d.format("HH:mm")}`;
  }

  // Older → "Nov 26, 14:30" (EU 24h time)
  return d.format("MMM DD, HH:mm");
};
export const formatPaymentDate = (date?: string) => {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
};
