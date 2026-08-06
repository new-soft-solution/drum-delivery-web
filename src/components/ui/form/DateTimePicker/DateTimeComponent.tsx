"use client";

import React, { forwardRef } from "react";
import { Form } from "react-bootstrap";
import DatePicker from "react-datepicker";

import dayjs from "dayjs";
import { TimeZone } from "@/constant/global.constant";

// Convert incoming string value -> Date (for the picker), based on mode
const parseValueToDate = (
  value: string | null | undefined,
  mode: "date" | "datetime",
  tz: string
) => {
  if (!value) return null;

  if (mode === "date") {
    // IMPORTANT: do NOT apply timezone transforms for date-only.
    // Treat YYYY-MM-DD as a local calendar day so there’s no off-by-one.
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const d = dayjs(value); // local parse, no tz()
      return d.isValid() ? d.toDate() : null;
    }
    // If an ISO sneaks in, still avoid tz() so we keep the calendar day intact.
    const d = dayjs(value);
    return d.isValid() ? d.toDate() : null;
  }

  // datetime mode: use timezone
  const d = dayjs(value).tz(tz);
  return d.isValid() ? d.toDate() : null;
};

// Convert Date -> out string shape based on mode
const dateToOutput = (
  d: Date | null,
  mode: "date" | "datetime",
  tz: string
): string | null => {
  if (!d) return null;

  if (mode === "date") {
    // IMPORTANT: no tz() here for date-only to avoid shifting the day.
    return dayjs(d).format("YYYY-MM-DD");
  }

  // datetime → ISO string in the target tz
  return dayjs(d).tz(tz).toISOString();
};

// Make DatePicker look like Bootstrap Form.Control
type ControlProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "value" | "defaultValue"
> & {
  size?: "sm" | "lg";
  htmlSize?: number;
  isInvalid?: boolean;
  value?: string | number | readonly string[] | undefined;
  defaultValue?: string | number | readonly string[] | undefined;
};

export const ControlInput = forwardRef<HTMLInputElement, ControlProps>(
  function ControlInput(
    { isInvalid, htmlSize, value, defaultValue, onKeyDown, ...rest },
    ref
  ) {
    const normalize = (v: ControlProps["value"]) =>
      Array.isArray(v) ? [...v] : v;

    return (
      <Form.Control
        ref={ref}
        {...rest}
        htmlSize={htmlSize}
        isInvalid={isInvalid}
        value={normalize(value) as string | number | string[] | undefined}
        defaultValue={
          normalize(defaultValue) as string | number | string[] | undefined
        }
        onKeyDown={(e) => {
          // prevent manual typing; picker controls the input
          e.preventDefault();
          onKeyDown?.(e as React.KeyboardEvent<HTMLInputElement>);
        }}
        readOnly
      />
    );
  }
);

export type DateTimeComponentProps = {
  /** Current value. For mode='date' use 'YYYY-MM-DD', for mode='datetime' use ISO string. */
  value: string | null;
  /** Called with new serialized value (YYYY-MM-DD for date; ISO for datetime). */
  onChange: (next: string | null) => void;

  mode?: "date" | "datetime";
  placeholder?: string;
  isInvalid?: boolean;
  disabled?: boolean;
  calendarStartDay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  timeIntervals?: number;
  withPortal?: boolean;
  dateFormat?: string;
  className?: string;
  tz?: string;
};

export const DateTimeComponent: React.FC<DateTimeComponentProps> = ({
  value,
  onChange,
  mode = "date",
  placeholder,
  isInvalid,
  disabled,
  calendarStartDay = 1,
  timeIntervals = 5,
  withPortal = true,
  dateFormat,
  className,
  tz = TimeZone,
}) => {
  const selected = parseValueToDate(value, mode, tz);

  const df =
    dateFormat ?? (mode === "datetime" ? "dd-MM-yyyy HH:mm" : "dd-MM-yyyy");

  const placeholderText =
    placeholder ?? (mode === "datetime" ? "DD-MM-YYYY HH:mm" : "DD-MM-YYYY");

  return (
    <DatePicker
      selected={selected ?? null}
      onChange={(date: Date | null) => onChange(dateToOutput(date, mode, tz))}
      showTimeSelect={mode === "datetime"}
      timeIntervals={timeIntervals}
      timeCaption="Time"
      dateFormat={df}
      placeholderText={placeholderText}
      isClearable
      withPortal={withPortal}
      calendarStartDay={calendarStartDay}
      shouldCloseOnSelect
      disabled={!!disabled}
      customInput={<ControlInput isInvalid={isInvalid} className={className} />}
    />
  );
};
