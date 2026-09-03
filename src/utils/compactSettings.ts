const MOBILE_KEYS = [
  "customer_mobile_app_settings",
  "restaurant_manager_mobile_app_settings",
  "pos_mobile_app_settings",
];

export function compactSettings(values: Record<string, unknown>) {
  const result: Record<string, unknown> = { ...values };

  MOBILE_KEYS.forEach((baseKey) => {
    const nested: Record<string, unknown> = {};

    Object.keys(values).forEach((k) => {
      if (k.startsWith(`${baseKey}.`)) {
        nested[k.replace(`${baseKey}.`, "")] = values[k];
        delete result[k];
      }
    });

    // backend expects STRING
    result[baseKey] = JSON.stringify(nested);
  });

  return result;
}
