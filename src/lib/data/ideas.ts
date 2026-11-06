import { and, count, desc, eq, sql } from "drizzle-orm";
import { db, schema } from "@/db";

export const IDEA_STATUSES = ["abierta", "en_evaluacion", "cerrada", "convertida"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const IDEA_STATUS_LABEL: Record<IdeaStatus, string> = {
  abierta: "Abierta",
  en_evaluacion: "En evaluación",
  cerrada: "Cerrada",
  convertida: "Convertida en propuesta",
};

export function isIdeaStatus(v: string): v is IdeaStatus {
  return (IDEA_STATUSES as readonly string[]).includes(v);
}

/** Ideas con votos, comentarios y si el usuario ya votó. Filtro opcional por estado. */
export async function listIdeas(opts: { status?: IdeaStatus; userEmail: string; onlyMine?: boolean; limit?: number }) {
  const conditions = [];
  if (opts.status) conditions.push(eq(schema.ideas.status, opts.status));
  if (opts.onlyMine) conditions.push(eq(schema.ideas.createdByEmail, opts.userEmail));

  return db
    .select({
      id: schema.ideas.id,
      title: schema.ideas.title,
      description: schema.ideas.description,
      status: schema.ideas.status,
      createdByEmail: schema.ideas.createdByEmail,
      createdAt: schema.ideas.createdAt,
      votes: sql<number>`(select count(*)::int from ${schema.ideaVotes} v where v.idea_id = ${schema.ideas.id})`,
      comments: sql<number>`(select count(*)::int from ${schema.ideaComments} c where c.idea_id = ${schema.ideas.id})`,
      votedByMe: sql<boolean>`exists(select 1 from ${schema.ideaVotes} v where v.idea_id = ${schema.ideas.id} and v.user_email = ${opts.userEmail})`,
    })
    .from(schema.ideas)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(schema.ideas.createdAt))
    .limit(opts.limit ?? 200);
}

export async function countIdeasByStatus(): Promise<Record<IdeaStatus, number>> {
  const rows = await db
    .select({ status: schema.ideas.status, n: count() })
    .from(schema.ideas)
    .groupBy(schema.ideas.status);
  const out = Object.fromEntries(IDEA_STATUSES.map((s) => [s, 0])) as Record<IdeaStatus, number>;
  for (const r of rows) out[r.status] = Number(r.n);
  return out;
}

export async function getIdea(id: number, userEmail: string) {
  const [idea] = await db
    .select({
      id: schema.ideas.id,
      title: schema.ideas.title,
      description: schema.ideas.description,
      status: schema.ideas.status,
      createdByEmail: schema.ideas.createdByEmail,
      createdAt: schema.ideas.createdAt,
      votes: sql<number>`(select count(*)::int from ${schema.ideaVotes} v where v.idea_id = ${schema.ideas.id})`,
      votedByMe: sql<boolean>`exists(select 1 from ${schema.ideaVotes} v where v.idea_id = ${schema.ideas.id} and v.user_email = ${userEmail})`,
    })
    .from(schema.ideas)
    .where(eq(schema.ideas.id, id))
    .limit(1);
  if (!idea) return null;

  const comments = await db
    .select({
      id: schema.ideaComments.id,
      authorEmail: schema.ideaComments.authorEmail,
      body: schema.ideaComments.body,
      createdAt: schema.ideaComments.createdAt,
    })
    .from(schema.ideaComments)
    .where(eq(schema.ideaComments.ideaId, id))
    .orderBy(schema.ideaComments.createdAt);

  const linkedProposals = await db
    .select({ id: schema.proposals.id, title: schema.proposals.title })
    .from(schema.proposals)
    .where(eq(schema.proposals.ideaId, id));

  return { ...idea, comments, linkedProposals };
}

/** Alterna el voto del usuario. Devuelve si ahora votó. */
export async function toggleVote(ideaId: number, userEmail: string): Promise<boolean> {
  const [existing] = await db
    .select({ ideaId: schema.ideaVotes.ideaId })
    .from(schema.ideaVotes)
    .where(and(eq(schema.ideaVotes.ideaId, ideaId), eq(schema.ideaVotes.userEmail, userEmail)))
    .limit(1);
  if (existing) {
    await db
      .delete(schema.ideaVotes)
      .where(and(eq(schema.ideaVotes.ideaId, ideaId), eq(schema.ideaVotes.userEmail, userEmail)));
    return false;
  }
  await db.insert(schema.ideaVotes).values({ ideaId, userEmail }).onConflictDoNothing();
  return true;
}

export async function addComment(ideaId: number, authorEmail: string, body: string) {
  await db.insert(schema.ideaComments).values({ ideaId, authorEmail, body });
}

export async function setIdeaStatus(id: number, status: IdeaStatus) {
  await db.update(schema.ideas).set({ status }).where(eq(schema.ideas.id, id));
}

export async function createIdea(input: { title: string; description: string | null; createdByEmail: string }) {
  await db.insert(schema.ideas).values(input);
}

/** Título y estado de una idea, para precargar una propuesta. */
export async function getIdeaBasics(id: number) {
  const [row] = await db
    .select({ id: schema.ideas.id, title: schema.ideas.title, status: schema.ideas.status })
    .from(schema.ideas)
    .where(eq(schema.ideas.id, id))
    .limit(1);
  return row ?? null;
}

/** Top de ideas por votos, con fuente configurable: todas, mías o cerradas. */
export async function listTopIdeas(opts: { userEmail: string; source: "todas" | "mias" | "cerradas"; limit: number }) {
  const conditions = [];
  if (opts.source === "mias") conditions.push(eq(schema.ideas.createdByEmail, opts.userEmail));
  if (opts.source === "cerradas") conditions.push(eq(schema.ideas.status, "cerrada"));
  return db
    .select({
      id: schema.ideas.id,
      title: schema.ideas.title,
      status: schema.ideas.status,
      votes: sql<number>`(select count(*)::int from ${schema.ideaVotes} v where v.idea_id = ${schema.ideas.id})`,
      votedByMe: sql<boolean>`exists(select 1 from ${schema.ideaVotes} v where v.idea_id = ${schema.ideas.id} and v.user_email = ${opts.userEmail})`,
    })
    .from(schema.ideas)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(sql`(select count(*) from ${schema.ideaVotes} v where v.idea_id = ${schema.ideas.id})`), desc(schema.ideas.createdAt))
    .limit(opts.limit);
}
