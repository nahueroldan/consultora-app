"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { getPerson, confirmPersonById, listPeopleByArea } from "@/lib/data/people";
import { canSeeField, normalizeVisibility } from "@/lib/profile/visibility";

const PAGE_SIZE = 40;

/** Carga una página de personas de un área. Pendientes solo para admin. */
export async function loadAreaPageAction(input: { area: string; q: string; offset: number }) {
  const user = await requireUser();
  const includePending = user.role === "admin";
  const rows = await listPeopleByArea({
    area: input.area,
    q: input.q.trim() || undefined,
    offset: Math.max(0, input.offset),
    limit: PAGE_SIZE + 1,
    includePending,
  });
  const hasMore = rows.length > PAGE_SIZE;
  // El cargo solo se muestra si la persona lo dejó visible (dueño y admin lo ven siempre).
  const viewer = { personId: user.personId, role: user.role };
  const items = rows.slice(0, PAGE_SIZE).map((r) => ({
    id: r.id,
    firstName: r.firstName,
    lastName: r.lastName,
    status: r.status,
    position: canSeeField(r.id, "position", normalizeVisibility(r.visibility), viewer) ? r.position : null,
  }));
  return { items, hasMore };
}

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
