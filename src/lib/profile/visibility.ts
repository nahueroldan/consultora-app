// Qué datos de un perfil ve cada persona. El dueño y el admin ven todo; el resto,
// solo lo que el dueño marcó como visible.

export const VISIBLE_FIELDS = ["country", "city", "position", "linkedin", "skills"] as const;
export type VisibleField = (typeof VISIBLE_FIELDS)[number];
export type Visibility = Record<VisibleField, boolean>;

export const DEFAULT_VISIBILITY: Visibility = {
  country: true,
  city: true,
  position: true,
  linkedin: true,
  skills: true,
};

/** Normaliza el JSON guardado: campos faltantes o inválidos se toman como visibles. */
export function normalizeVisibility(raw: unknown): Visibility {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out = { ...DEFAULT_VISIBILITY };
  for (const f of VISIBLE_FIELDS) {
    if (typeof src[f] === "boolean") out[f] = src[f];
  }
  return out;
}

type Viewer = { personId: number | null; role: string | null };

/** Devuelve true si el viewer puede ver el campo del perfil. */
export function canSeeField(personId: number, field: VisibleField, visibility: Visibility, viewer: Viewer): boolean {
  if (viewer.personId === personId) return true;
  if (viewer.role === "admin") return true;
  return visibility[field];
}
