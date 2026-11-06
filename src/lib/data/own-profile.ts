import { eq } from "drizzle-orm";
import { db, schema } from "@/db";

/** Datos propios del perfil, para editarlos en "Mi perfil". */
export async function getOwnProfile(personId: number) {
  const [row] = await db
    .select({
      position: schema.people.position,
      city: schema.people.city,
      country: schema.people.country,
      linkedin: schema.people.linkedin,
      visibility: schema.people.visibility,
    })
    .from(schema.people)
    .where(eq(schema.people.id, personId))
    .limit(1);
  return row ?? null;
}
