export const buildQueryParams = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any
): URLSearchParams => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, String(v)));
    } else {
      query.set(key, String(value));
    }
  });

  return query;
};
