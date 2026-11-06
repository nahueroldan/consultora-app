import { and, asc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

export const PROJECT_STATUSES = ["propuesta", "activo", "cerrado"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function isProjectStatus(v: string): v is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(v);
}

export async function listProjects() {
  return db
    .select({
      id: schema.projects.id,
      name: schema.projects.name,
      client: schema.projects.client,
      url: schema.projects.url,
      status: schema.projects.status,
      squads: sql<number>`(select count(*)::int from ${schema.squads} s where s.project_id = ${schema.projects.id})`,
    })
    .from(schema.projects)
    .orderBy(asc(schema.projects.name));
}

export async function getProject(id: number) {
  const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
  if (!project) return null;

  const squads = await db
    .select({ id: schema.squads.id, name: schema.squads.name })
    .from(schema.squads)
    .where(eq(schema.squads.projectId, id))
    .orderBy(asc(schema.squads.name));

  const members = await db
    .select({
      squadId: schema.squadMembers.squadId,
      personId: schema.people.id,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
      position: schema.people.position,
      roleInSquad: schema.squadMembers.roleInSquad,
      allocationPct: schema.squadMembers.allocationPct,
    })
    .from(schema.squadMembers)
    .innerJoin(schema.squads, eq(schema.squads.id, schema.squadMembers.squadId))
    .innerJoin(schema.people, eq(schema.people.id, schema.squadMembers.personId))
    .where(eq(schema.squads.projectId, id));

  return { ...project, squads, members };
}

/** Personas confirmadas disponibles para sumar a un squad (solo confirmadas). */
export async function listConfirmedPeople() {
  return db
    .select({
      id: schema.people.id,
      firstName: schema.people.firstName,
      lastName: schema.people.lastName,
      position: schema.people.position,
    })
    .from(schema.people)
    .where(eq(schema.people.status, "confirmed"))
    .orderBy(asc(schema.people.lastName), asc(schema.people.firstName))
    .limit(1000);
}

/** Verifica que la persona esté confirmada. Requisito para sumarla a un squad. */
export async function isPersonConfirmed(personId: number): Promise<boolean> {
  const rows = await db
    .select({ id: schema.people.id })
    .from(schema.people)
    .where(and(eq(schema.people.id, personId), eq(schema.people.status, "confirmed")))
    .limit(1);
  return rows.length > 0;
}

export async function createProject(input: {
  name: string;
  client: string | null;
  description: string | null;
  url?: string | null;
  ideaId?: number | null;
  status: ProjectStatus;
  createdByEmail: string;
}) {
  const [row] = await db.insert(schema.projects).values(input).returning({ id: schema.projects.id });
  return row.id;
}

export async function setProjectStatus(id: number, status: ProjectStatus) {
  await db.update(schema.projects).set({ status }).where(eq(schema.projects.id, id));
}

export async function createSquad(projectId: number, name: string) {
  await db.insert(schema.squads).values({ projectId, name });
}

export async function addSquadMember(input: {
  squadId: number;
  personId: number;
  roleInSquad: string | null;
  allocationPct: number;
}) {
  await db
    .insert(schema.squadMembers)
    .values(input)
    .onConflictDoUpdate({
      target: [schema.squadMembers.squadId, schema.squadMembers.personId],
      set: { roleInSquad: input.roleInSquad, allocationPct: input.allocationPct },
    });
}

export async function removeSquadMember(squadId: number, personId: number) {
  await db
    .delete(schema.squadMembers)
    .where(and(eq(schema.squadMembers.squadId, squadId), eq(schema.squadMembers.personId, personId)));
}

/** Devuelve el projectId de un squad, o null si no existe. */
export async function projectIdOfSquad(squadId: number): Promise<number | null> {
  const [row] = await db
    .select({ projectId: schema.squads.projectId })
    .from(schema.squads)
    .where(eq(schema.squads.id, squadId))
    .limit(1);
  return row?.projectId ?? null;
}

export async function updateProject(
  id: number,
  input: { name: string; client: string | null; description: string | null; url: string | null; status: ProjectStatus },
) {
  await db.update(schema.projects).set(input).where(eq(schema.projects.id, id));
}

/** Proyecto creado a partir de esta idea, si existe. */
export async function projectFromIdea(ideaId: number) {
  const [row] = await db
    .select({ id: schema.projects.id, name: schema.projects.name })
    .from(schema.projects)
    .where(eq(schema.projects.ideaId, ideaId))
    .limit(1);
  return row ?? null;
}
