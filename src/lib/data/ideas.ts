import { desc } from "drizzle-orm";
import { db, schema } from "@/db";

export async function listIdeas() {
  return db
    .select({
      id: schema.ideas.id,
      title: schema.ideas.title,
      description: schema.ideas.description,
      createdByEmail: schema.ideas.createdByEmail,
      createdAt: schema.ideas.createdAt,
    })
    .from(schema.ideas)
    .orderBy(desc(schema.ideas.createdAt))
    .limit(200);
}

export async function createIdea(input: { title: string; description: string | null; createdByEmail: string }) {
  await db.insert(schema.ideas).values(input);
}
