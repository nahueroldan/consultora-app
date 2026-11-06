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

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

export async function createProjectAction(fd: FormData) {
  const user = await requirePermission("proyecto:editar");
  const name = str(fd, "name");
  const status = str(fd, "status") || "propuesta";
  if (!name) throw new Error("El nombre del proyecto es obligatorio.");
  if (!isProjectStatus(status)) throw new Error("Estado inválido.");
  await createProject({
    name,
    client: str(fd, "client") || null,
    description: str(fd, "description") || null,
    status,
    createdByEmail: user.email,
  });
  revalidatePath("/proyectos");
}

export async function setProjectStatusAction(fd: FormData) {
  await requirePermission("proyecto:editar");
  const id = Number(fd.get("projectId"));
  const status = str(fd, "status");
  if (!Number.isInteger(id)) throw new Error("Proyecto inválido.");
  if (!isProjectStatus(status)) throw new Error("Estado inválido.");
  await setProjectStatus(id, status);
  revalidatePath(`/proyectos/${id}`);
  revalidatePath("/proyectos");
}

export async function createSquadAction(fd: FormData) {
  await requirePermission("squad:editar");
  const projectId = Number(fd.get("projectId"));
  const name = str(fd, "name");
  if (!Number.isInteger(projectId)) throw new Error("Proyecto inválido.");
  if (!name) throw new Error("El nombre del squad es obligatorio.");
  await createSquad(projectId, name);
  revalidatePath(`/proyectos/${projectId}`);
}

export async function addMemberAction(fd: FormData) {
  await requirePermission("squad:editar");
  const squadId = Number(fd.get("squadId"));
  const personId = Number(fd.get("personId"));
  const allocation = Number(fd.get("allocationPct") || 100);
  if (!Number.isInteger(squadId) || !Number.isInteger(personId)) throw new Error("Datos inválidos.");
  if (!Number.isInteger(allocation) || allocation < 1 || allocation > 100) {
    throw new Error("La dedicación debe ser un entero entre 1 y 100.");
  }
  // Regla de negocio: solo personas que confirmaron su perfil entran a un squad.
  if (!(await isPersonConfirmed(personId))) {
    throw new Error("Solo se pueden sumar personas con perfil confirmado.");
  }
  await addSquadMember({
    squadId,
    personId,
    roleInSquad: str(fd, "roleInSquad") || null,
    allocationPct: allocation,
  });
  const projectId = await projectIdOfSquad(squadId);
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}

export async function removeMemberAction(fd: FormData) {
  await requirePermission("squad:editar");
  const squadId = Number(fd.get("squadId"));
  const personId = Number(fd.get("personId"));
  if (!Number.isInteger(squadId) || !Number.isInteger(personId)) throw new Error("Datos inválidos.");
  await removeSquadMember(squadId, personId);
  const projectId = await projectIdOfSquad(squadId);
  if (projectId) revalidatePath(`/proyectos/${projectId}`);
}
