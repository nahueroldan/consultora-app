/** URL opcional de un proyecto: vacía -> null; debe empezar con http:// o https://. */
export function cleanOptionalUrl(raw: string | null | undefined): { value: string | null } | { error: string } {
  const v = (raw ?? "").trim();
  if (!v) return { value: null };
  if (!/^https?:\/\/[^\s]+$/i.test(v)) return { error: "La URL tiene que empezar con https:// o http://" };
  if (v.length > 300) return { error: "La URL es demasiado larga." };
  return { value: v };
}
