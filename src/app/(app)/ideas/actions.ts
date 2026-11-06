"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createIdea } from "@/lib/data/ideas";
import { fail, ok, requiredText, safeAction, type ActionResult } from "@/lib/form-result";

export async function createIdeaAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requirePermission("idea:editar");
    const title = requiredText(fd.get("title"), "El título");
    if ("error" in title) return fail(title.error);
    if (title.value.length > 120) return fail("El título no puede pasar de 120 caracteres.");
    const description = String(fd.get("description") ?? "").trim();
    await createIdea({ title: title.value, description: description || null, createdByEmail: user.email });
    revalidatePath("/ideas");
    revalidatePath("/");
    return ok();
  });
}
