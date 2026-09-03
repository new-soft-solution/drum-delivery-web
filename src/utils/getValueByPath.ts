export function getValueByPath(obj: unknown, path: string): unknown {
  try {
    return path
      .replace(/\[(\w+)\]/g, ".$1")
      .split(".")
      .reduce(
        (acc: unknown, key) =>
          (acc as Record<string, unknown> | undefined)?.[key],
        obj
      );
  } catch {
    return undefined;
  }
}
