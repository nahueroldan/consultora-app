import { and, asc, eq, isNull } from "drizzle-orm";
import { db, schema } from "@/db";
import { nameTokens, rankCandidates, type Candidate } from "@/lib/profile/match";

/**
 * Perfiles que podrían ser de esta cuenta, según el nombre de Google.
 * Se compara en código (sin acentos), para no depender de extensiones de la base.
 */
export async function findCandidates(accountName: string | null | undefined): Promise<Candidate[]> {
  if (nameTokens(accountName).length === 0) return [];
  const rows = await db
    .select({
      id: schema.people.id,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
      position: schema.people.position,
    })
    .from(schema.people)
    .orderBy(asc(schema.people.lastName));
  return rankCandidates(accountName, rows);
}

/** Vincula la cuenta con un perfil. Falla si la cuenta ya tiene uno o el perfil es de otra cuenta. */
export async function claimPerson(userEmail: string, personId: number): Promise<{ ok: true } | { ok: false; error: string }> {
  const [owner] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.personId, personId))
    .limit(1);
  if (owner) return { ok: false, error: "Ese perfil ya está vinculado a otra cuenta. Pedile a un admin que lo revise." };

  const updated = await db
    .update(schema.users)
    .set({ personId, linkRequested: false })
    .where(and(eq(schema.users.email, userEmail), isNull(schema.users.personId)))
    .returning({ id: schema.users.id });
  if (updated.length === 0) return { ok: false, error: "Tu cuenta ya tiene un perfil vinculado." };
  return { ok: true };
}

export async function requestLink(userEmail: string) {
  await db.update(schema.users).set({ linkRequested: true }).where(eq(schema.users.email, userEmail));
}

/** Campos editables del propio perfil y su visibilidad para el resto. */
export type OwnProfileInput = {
  position: string | null;
  city: string | null;
  country: string | null;
  linkedin: string | null;
  visibility: { position: boolean; city: boolean; country: boolean; linkedin: boolean; skills: boolean };
};

export async function updateOwnProfile(personId: number, input: OwnProfileInput) {
  await db
    .update(schema.people)
    .set({
      position: input.position,
      city: input.city,
      country: input.country,
      linkedin: input.linkedin,
      visibility: input.visibility,
    })
    .where(eq(schema.people.id, personId));
}

export async function getUserLinkState(userEmail: string) {
  const [row] = await db
    .select({ name: schema.users.name, personId: schema.users.personId, linkRequested: schema.users.linkRequested })
    .from(schema.users)
    .where(eq(schema.users.email, userEmail))
    .limit(1);
  return row ?? null;
}
