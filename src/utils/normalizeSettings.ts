import { parsePythonDict } from "@/utils/mobileSettings";

export function normalizeSettings(data: Record<string, unknown>) {
  const clone = { ...data };

  // const parse = (value: unknown) => {
  //   if (typeof value !== "string") return value;
  //   try {
  //     console.log(typeof value);
  //     return JSON.parse(value);
  //   } catch {
  //     return value;
  //   }
  // };

  clone.loyalty = parsePythonDict(data.loyalty);
  clone.customer_mobile_app_settings = parsePythonDict(
    data.customer_mobile_app_settings,
  );

  clone.restaurant_manager_mobile_app_settings = parsePythonDict(
    data.restaurant_manager_mobile_app_settings,
  );

  clone.pos_mobile_app_settings = parsePythonDict(data.pos_mobile_app_settings);

  return clone;
}
