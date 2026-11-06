/** Normaliza un email para comparar: sin espacios y en minúsculas. */
export function normalizeEmail(value: string | null | undefined): string | null {
  const v = (value ?? "").trim().toLowerCase();
  return v.length > 0 && v.includes("@") ? v : null;
}
