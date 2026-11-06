"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import {
  addSquadMember,
  createProject,
  createSquad,
  isPersonConfirmed,
  isProjectStatus,
  projectIdOfSquad,
  removeSquadMember,
  setProjectStatus,
} from "@/lib/data/projects";
import { fail, ok, requiredText, safeAction, type ActionResult } from "@/lib/form-result";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createProjectAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requirePermission("proyecto:editar");
    const name = requiredText(fd.get("name"), "El nombre del proyecto");
    if ("error" in name) return fail(name.error);
    const status = str(fd, "status") || "propuesta";
    if (!isProjectStatus(status)) return fail("El estado no es válido.");
    await createProject({
      name: name.value,
      client: str(fd, "client") || null,
      description: str(fd, "description") || null,
      status,
      createdByEmail: user.email,
    });
    revalidatePath("/proyectos");
    return ok();
  });
}

export async function setProjectStatusAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("proyecto:editar");
    const id = Number(fd.get("projectId"));
    const status = str(fd, "status");
    if (!Number.isInteger(id)) return fail("El proyecto no es válido.");
    if (!isProjectStatus(status)) return fail("El estado no es válido.");
    await setProjectStatus(id, status);
    revalidatePath(`/proyectos/${id}`);
    revalidatePath("/proyectos");
    return ok();
  });
}

export async function createSquadAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("squad:editar");
    const projectId = Number(fd.get("projectId"));
    const name = requiredText(fd.get("name"), "El nombre del squad");
    if (!Number.isInteger(projectId)) return fail("El proyecto no es válido.");
    if ("error" in name) return fail(name.error);
    await createSquad(projectId, name.value);
    revalidatePath(`/proyectos/${projectId}`);
    return ok();
  });
}

export async function addMemberAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("squad:editar");
    const squadId = Number(fd.get("squadId"));
    const personId = Number(fd.get("personId"));
    const allocation = Number(fd.get("allocationPct") || 100);
    if (!Number.isInteger(squadId) || !Number.isInteger(personId)) return fail("Datos inválidos.");
    if (!Number.isInteger(allocation) || allocation < 1 || allocation > 100) {
      return fail("La dedicación debe ser un entero entre 1 y 100.");
    }
    // Regla de negocio: solo personas que confirmaron su perfil entran a un squad.
    if (!(await isPersonConfirmed(personId))) {
      return fail("Solo se pueden sumar personas con perfil confirmado.");
    }
    await addSquadMember({
      squadId,
      personId,
      roleInSquad: str(fd, "roleInSquad") || null,
      allocationPct: allocation,
    });
    const projectId = await projectIdOfSquad(squadId);
    if (projectId) revalidatePath(`/proyectos/${projectId}`);
    return ok();
  });
}

export async function removeMemberAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("squad:editar");
    const squadId = Number(fd.get("squadId"));
    const personId = Number(fd.get("personId"));
    if (!Number.isInteger(squadId) || !Number.isInteger(personId)) return fail("Datos inválidos.");
    await removeSquadMember(squadId, personId);
    const projectId = await projectIdOfSquad(squadId);
    if (projectId) revalidatePath(`/proyectos/${projectId}`);
    return ok();
  });
}
