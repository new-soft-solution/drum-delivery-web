export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "switch"
  | "file"
  | "url"
  | "email"
  | "datetime-local"
  | "time"
  | "hour"
  | "minute"
  | "second"
  | "password"
  | "tags";

export type FieldOption = { label: string; value: string | number };

export type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  help?: string;
  options?: FieldOption[];
  rows?: number;
  accept?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  prefix?: string;
  suffix?: string;
};

export type CategoryConfig = {
  label: string;
  description?: string;
  fields: FieldConfig[];
  subCategories?: Record<string, CategoryConfig>;
};
