import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db, schema } from "@/db";

export type DirectoryFilters = {
  q?: string;
  area?: string;
  skill?: string;
  includePending: boolean;
};

/** Normaliza los filtros que vienen de la URL. */
export function parseDirectoryFilters(
  params: Record<string, string | string[] | undefined>,
  includePending: boolean,
): DirectoryFilters {
  const pick = (k: string) => {
    const v = params[k];
    const s = Array.isArray(v) ? v[0] : v;
    const t = s?.trim();
    return t ? t : undefined;
  };
  return { q: pick("q"), area: pick("area"), skill: pick("skill"), includePending };
}

export async function listPeople(filters: DirectoryFilters) {
  const conditions = [];
  if (!filters.includePending) {
    conditions.push(eq(schema.people.status, "confirmed"));
  }
  if (filters.q) {
    const like = `%${filters.q}%`;
    conditions.push(
      or(
        ilike(schema.people.firstName, like),
        ilike(schema.people.lastName, like),
        ilike(schema.people.position, like),
      )!,
    );
  }
  if (filters.area) {
    conditions.push(eq(schema.people.area, filters.area));
  }
  if (filters.skill) {
    conditions.push(
      sql`${schema.people.id} in (
        select ps.person_id from ${schema.personSkills} ps
        join ${schema.skills} s on s.id = ps.skill_id
        where s.name = ${filters.skill})`,
    );
  }

  return db
    .select({
      id: schema.people.id,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
      area: schema.people.area,
      position: schema.people.position,
      city: schema.people.city,
      status: schema.people.status,
      needsReview: schema.people.needsReview,
    })
    .from(schema.people)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(schema.people.lastName), asc(schema.people.firstName))
    .limit(200);
}

export async function getPerson(id: number) {
  const [person] = await db.select().from(schema.people).where(eq(schema.people.id, id)).limit(1);
  if (!person) return null;
  const skills = await db
    .select({ name: schema.skills.name, level: schema.personSkills.level })
    .from(schema.personSkills)
    .innerJoin(schema.skills, eq(schema.skills.id, schema.personSkills.skillId))
    .where(eq(schema.personSkills.personId, id))
    .orderBy(asc(schema.skills.name));
  return { ...person, skills };
}

export async function listAreas(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ area: schema.people.area })
    .from(schema.people)
    .where(sql`${schema.people.area} is not null`)
    .orderBy(asc(schema.people.area));
  return rows.map((r) => r.area!).filter(Boolean);
}

export async function listSkillNames(): Promise<string[]> {
  const rows = await db.select({ name: schema.skills.name }).from(schema.skills).orderBy(asc(schema.skills.name)).limit(500);
  return rows.map((r) => r.name);
}

export async function confirmPersonById(id: number) {
  await db
    .update(schema.people)
    .set({ status: "confirmed", confirmedAt: new Date() })
    .where(and(eq(schema.people.id, id), eq(schema.people.status, "pending")));
}

export async function countByStatus() {
  const rows = await db
    .select({ status: schema.people.status, n: sql<number>`count(*)::int` })
    .from(schema.people)
    .groupBy(schema.people.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
}


/** Resumen por área: cantidad de personas visibles. Pendientes solo si includePending. */
export async function listAreaSummary(includePending: boolean) {
  const rows = await db
    .select({
      area: schema.people.area,
      n: sql<number>`count(*)::int`,
    })
    .from(schema.people)
    .where(
      and(
        sql`${schema.people.area} is not null`,
        includePending ? undefined : eq(schema.people.status, "confirmed"),
      ),
    )
    .groupBy(schema.people.area)
    .orderBy(sql`count(*) desc`, asc(schema.people.area));
  return rows.map((r) => ({ area: r.area!, count: r.n }));
}

/** Página de personas de un área, para carga progresiva. */
export async function listPeopleByArea(input: {
  area: string;
  q?: string;
  offset: number;
  limit: number;
  includePending: boolean;
}) {
  const conditions = [eq(schema.people.area, input.area)];
  if (!input.includePending) conditions.push(eq(schema.people.status, "confirmed"));
  if (input.q) {
    const like = `%${input.q}%`;
    conditions.push(
      or(ilike(schema.people.firstName, like), ilike(schema.people.lastName, like), ilike(schema.people.position, like))!,
    );
  }
  return db
    .select({
      id: schema.people.id,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
      position: schema.people.position,
      status: schema.people.status,
    })
    .from(schema.people)
    .where(and(...conditions))
    .orderBy(asc(schema.people.lastName), asc(schema.people.firstName))
    .offset(input.offset)
    .limit(input.limit);
}
