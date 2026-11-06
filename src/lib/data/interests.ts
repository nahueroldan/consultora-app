import { and, asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";

/** Registra el interés de una persona en un proyecto (una vez; si ya existe, no cambia). */
export async function expressInterest(projectId: number, userEmail: string) {
  await db
    .insert(schema.projectInterests)
    .values({ projectId, userEmail })
    .onConflictDoNothing();
}

export async function setInterestStatus(projectId: number, userEmail: string, status: "aceptada" | "rechazada") {
  await db
    .update(schema.projectInterests)
    .set({ status })
    .where(and(eq(schema.projectInterests.projectId, projectId), eq(schema.projectInterests.userEmail, userEmail)));
}

export async function myInterest(projectId: number, userEmail: string): Promise<string | null> {
  const [row] = await db
    .select({ status: schema.projectInterests.status })
    .from(schema.projectInterests)
    .where(and(eq(schema.projectInterests.projectId, projectId), eq(schema.projectInterests.userEmail, userEmail)))
    .limit(1);
  return row?.status ?? null;
}

/** Interesados de un proyecto, con su nombre de perfil si la cuenta está vinculada. */
export async function listInterests(projectId: number) {
  return db
    .select({
      userEmail: schema.projectInterests.userEmail,
      status: schema.projectInterests.status,
      createdAt: schema.projectInterests.createdAt,
      personId: schema.users.personId,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
    })
    .from(schema.projectInterests)
    .leftJoin(schema.users, eq(schema.users.email, schema.projectInterests.userEmail))
    .leftJoin(schema.people, eq(schema.people.id, schema.users.personId))
    .where(eq(schema.projectInterests.projectId, projectId))
    .orderBy(asc(schema.projectInterests.createdAt));
}
