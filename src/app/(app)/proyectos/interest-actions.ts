"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, requireUser } from "@/lib/auth/session";
import { expressInterest, setInterestStatus } from "@/lib/data/interests";
import { fail, ok, safeAction, type ActionResult } from "@/lib/form-result";

export async function expressInterestAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    const projectId = Number(fd.get("projectId"));
    if (!Number.isInteger(projectId)) return fail("El proyecto no es válido.");
    await expressInterest(projectId, user.email);
    revalidatePath(`/proyectos/${projectId}`);
    return ok();
  });
}

/** Solo quien puede editar proyectos decide quién entra. */
export async function decideInterestAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("proyecto:editar");
    const projectId = Number(fd.get("projectId"));
    const email = String(fd.get("userEmail") ?? "");
    const decision = String(fd.get("decision") ?? "");
    if (!Number.isInteger(projectId) || !email) return fail("Datos inválidos.");
    if (decision !== "aceptada" && decision !== "rechazada") return fail("La decisión no es válida.");
    await setInterestStatus(projectId, email, decision);
    revalidatePath(`/proyectos/${projectId}`);
    return ok();
  });
}
