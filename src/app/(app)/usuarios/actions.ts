"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createUser, isRole, updateUser } from "@/lib/data/users";
import { fail, ok, safeAction, type ActionResult } from "@/lib/form-result";

export async function addUserAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("usuario:gestionar");
    const email = String(formData.get("email") ?? "");
    const role = String(formData.get("role") ?? "");
    if (!isRole(role)) return fail("El rol no es válido.");
    const result = await createUser(email, role);
    if (!result.ok) return fail(result.error);
    revalidatePath("/usuarios");
    return ok();
  });
}

export async function updateUserAction(formData: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    await requirePermission("usuario:gestionar");
    const id = Number(formData.get("id"));
    const role = String(formData.get("role") ?? "");
    const personRaw = String(formData.get("personId") ?? "").trim();
    if (!Number.isInteger(id)) return fail("El usuario no es válido.");
    if (!isRole(role)) return fail("El rol no es válido.");
    const personId = personRaw === "" ? null : Number(personRaw);
    if (personId !== null && !Number.isInteger(personId)) return fail("La persona no es válida.");
    await updateUser(id, role, personId);
    revalidatePath("/usuarios");
    return ok();
  });
}
