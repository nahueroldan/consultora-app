import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ProposalItem } from "@/lib/proposals/total";

export async function createProposal(input: {
  projectId: number;
  title: string;
  discountPct: number;
  notes: string | null;
  createdByEmail: string;
  items: ProposalItem[];
}) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(schema.proposals)
      .values({
        projectId: input.projectId,
        title: input.title,
        discountPct: input.discountPct,
        notes: input.notes,
        createdByEmail: input.createdByEmail,
      })
      .returning({ id: schema.proposals.id });
    if (input.items.length > 0) {
      await tx.insert(schema.proposalItems).values(
        input.items.map((i) => ({
          proposalId: row.id,
          role: i.role,
          hours: Math.round(i.hours),
          hourlyRate: Math.round(i.hourlyRate),
        })),
      );
    }
    return row.id;
  });
}

export async function listProposals() {
  return db
    .select({
      id: schema.proposals.id,
      title: schema.proposals.title,
      projectName: schema.projects.name,
      discountPct: schema.proposals.discountPct,
      createdAt: schema.proposals.createdAt,
    })
    .from(schema.proposals)
    .innerJoin(schema.projects, eq(schema.projects.id, schema.proposals.projectId))
    .orderBy(desc(schema.proposals.createdAt))
    .limit(200);
}

export async function getProposal(id: number) {
  const [head] = await db
    .select({
      id: schema.proposals.id,
      title: schema.proposals.title,
      notes: schema.proposals.notes,
      discountPct: schema.proposals.discountPct,
      createdAt: schema.proposals.createdAt,
      createdByEmail: schema.proposals.createdByEmail,
      projectName: schema.projects.name,
      client: schema.projects.client,
    })
    .from(schema.proposals)
    .innerJoin(schema.projects, eq(schema.projects.id, schema.proposals.projectId))
    .where(eq(schema.proposals.id, id))
    .limit(1);
  if (!head) return null;

  const items = await db
    .select({
      role: schema.proposalItems.role,
      hours: schema.proposalItems.hours,
      hourlyRate: schema.proposalItems.hourlyRate,
    })
    .from(schema.proposalItems)
    .where(eq(schema.proposalItems.proposalId, id));

  return { ...head, items };
}

export async function listProjectOptions() {
  return db
    .select({ id: schema.projects.id, name: schema.projects.name })
    .from(schema.projects)
    .orderBy(schema.projects.name);
}
