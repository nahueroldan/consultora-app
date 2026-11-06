// Matcheo entre la cuenta de Google y los perfiles del directorio, por nombre.
import { matchKey } from "@/lib/normalize";

export type Candidate = { id: number; firstName: string; lastName: string; position: string | null };

/** Tokens del nombre, sin acentos ni mayúsculas, sin palabras de una letra. */
export function nameTokens(value: string | null | undefined): string[] {
  return matchKey(value ?? "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
}

/**
 * Puntúa cada perfil según cuántas palabras del nombre de la cuenta aparecen en
 * nombre y apellido. Devuelve los que tienen al menos una coincidencia, mejores primero.
 */
export function rankCandidates(accountName: string | null | undefined, people: Candidate[], limit = 8): Candidate[] {
  const tokens = new Set(nameTokens(accountName));
  if (tokens.size === 0) return [];
  return people
    .map((p) => {
      const own = new Set(nameTokens(`${p.firstName} ${p.lastName}`));
      let score = 0;
      for (const t of tokens) if (own.has(t)) score++;
      // Coincidir nombre y apellido completos vale más que coincidir uno solo.
      const full = [...tokens].filter((t) => own.has(t)).length === own.size && own.size > 0;
      return { p, score: score + (full ? 1 : 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.lastName.localeCompare(b.p.lastName))
    .slice(0, limit)
    .map((x) => x.p);
}
