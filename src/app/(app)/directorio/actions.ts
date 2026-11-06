"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getPerson, confirmPersonById } from "@/lib/data/people";

/** Confirma un perfil. Lo puede hacer la propia persona o un admin. */
export async function confirmProfile(personId: number) {
  const user = await requireUser();
  const isOwn = user.personId === personId;
  const isAdmin = user.role === "admin";
  if (!isOwn && !isAdmin) {
    throw new Error("Solo la persona o un admin puede confirmar este perfil.");
  }
  const person = await getPerson(personId);
  if (!person) throw new Error("La persona no existe.");

  await confirmPersonById(personId);
  revalidatePath(`/directorio/${personId}`);
  revalidatePath("/directorio");
}
