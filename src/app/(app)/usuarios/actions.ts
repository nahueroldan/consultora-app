"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createUser, isRole, updateUser } from "@/lib/data/users";

export async function addUserAction(formData: FormData) {
  await requirePermission("usuario:gestionar");
  const email = String(formData.get("email") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!isRole(role)) throw new Error("Rol inválido.");
  const result = await createUser(email, role);
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/usuarios");
}

export async function updateUserAction(formData: FormData) {
  await requirePermission("usuario:gestionar");
  const id = Number(formData.get("id"));
  const role = String(formData.get("role") ?? "");
  const personRaw = String(formData.get("personId") ?? "").trim();
  if (!Number.isInteger(id)) throw new Error("Usuario inválido.");
  if (!isRole(role)) throw new Error("Rol inválido.");
  const personId = personRaw === "" ? null : Number(personRaw);
  if (personId !== null && !Number.isInteger(personId)) throw new Error("Persona inválida.");
  await updateUser(id, role, personId);
  revalidatePath("/usuarios");
}
