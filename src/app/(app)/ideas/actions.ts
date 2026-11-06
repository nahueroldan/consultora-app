"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireUser } from "@/lib/auth/session";
import { addComment, createIdea, isIdeaStatus, setIdeaStatus, toggleVote } from "@/lib/data/ideas";
import { fail, ok, requiredText, safeAction, type ActionResult } from "@/lib/form-result";

function revalidateIdeas(id?: number) {
  revalidatePath("/ideas");
  revalidatePath("/");
  if (id) revalidatePath(`/ideas/${id}`);
}

export async function createIdeaAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requirePermission("idea:editar");
    const title = requiredText(fd.get("title"), "El título");
    if ("error" in title) return fail(title.error);
    if (title.value.length > 120) return fail("El título no puede pasar de 120 caracteres.");
    const description = String(fd.get("description") ?? "").trim();
    await createIdea({ title: title.value, description: description || null, createdByEmail: user.email });
    revalidateIdeas();
    return ok();
  });
}

/** Cualquier usuario puede votar; un voto por persona, que se puede quitar. */
export async function voteIdeaAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    const id = Number(fd.get("ideaId"));
    if (!Number.isInteger(id)) return fail("La idea no es válida.");
    await toggleVote(id, user.email);
    revalidateIdeas(id);
    return ok();
  });
}

export async function commentIdeaAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    const id = Number(fd.get("ideaId"));
    if (!Number.isInteger(id)) return fail("La idea no es válida.");
    const body = requiredText(fd.get("body"), "El comentario");
    if ("error" in body) return fail(body.error);
    if (body.value.length > 1000) return fail("El comentario no puede pasar de 1000 caracteres.");
    await addComment(id, user.email, body.value);
    revalidateIdeas(id);
    return ok();
  });
}

export async function setIdeaStatusAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("idea:editar");
    const id = Number(fd.get("ideaId"));
    const status = String(fd.get("status") ?? "");
    if (!Number.isInteger(id)) return fail("La idea no es válida.");
    if (!isIdeaStatus(status)) return fail("El estado no es válido.");
    if (status === "convertida") return fail("Una idea pasa a convertida al crear su propuesta.");
    await setIdeaStatus(id, status);
    revalidateIdeas(id);
    return ok();
  });
}
