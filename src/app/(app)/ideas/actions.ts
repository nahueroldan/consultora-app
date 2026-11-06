"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createIdea } from "@/lib/data/ideas";

export async function createIdeaAction(fd: FormData) {
  const user = await requirePermission("idea:editar");
  const title = String(fd.get("title") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();
  if (!title) throw new Error("El título es obligatorio.");
  await createIdea({ title, description: description || null, createdByEmail: user.email });
  revalidatePath("/ideas");
}
