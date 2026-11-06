import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { normalizeEmail } from "@/lib/auth/email";
import { ROLES, type Role } from "@/lib/auth/roles";

export async function listUsers() {
  return db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      personId: schema.users.personId,
      linkRequested: schema.users.linkRequested,
      personName: schema.people.firstName,
      personLast: schema.people.lastName,
    })
    .from(schema.users)
    .leftJoin(schema.people, eq(schema.people.id, schema.users.personId))
    .orderBy(asc(schema.users.email));
}

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** Da de alta un usuario. Devuelve error si el email es inválido o ya existe. */
export async function createUser(rawEmail: string, role: Role) {
  const email = normalizeEmail(rawEmail);
  if (!email) return { ok: false as const, error: "Email inválido." };
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length > 0) return { ok: false as const, error: "Ese email ya tiene cuenta." };
  await db.insert(schema.users).values({ email, role });
  return { ok: true as const };
}

export async function updateUser(id: number, role: Role, personId: number | null) {
  await db.update(schema.users).set({ role, personId }).where(eq(schema.users.id, id));
}

/** Estado del recorrido de primer ingreso para un usuario. */
export async function getTourClosed(email: string): Promise<boolean> {
  const [row] = await db
    .select({ tourClosedAt: schema.users.tourClosedAt })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return row?.tourClosedAt != null;
}

export async function markTourClosed(email: string) {
  await db.update(schema.users).set({ tourClosedAt: new Date() }).where(eq(schema.users.email, email));
}
