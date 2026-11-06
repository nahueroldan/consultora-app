"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createProposal } from "@/lib/data/proposals";
import { computeProposalTotals, type ProposalItem } from "@/lib/proposals/total";

/** Lee las filas de items del formulario (hasta 8). Ignora filas vacías. */
function readItems(fd: FormData): ProposalItem[] {
  const items: ProposalItem[] = [];
  for (let i = 0; i < 8; i++) {
    const role = String(fd.get(`role_${i}`) ?? "").trim();
    const hours = Number(fd.get(`hours_${i}`) ?? 0);
    const hourlyRate = Number(fd.get(`rate_${i}`) ?? 0);
    if (!role && !hours && !hourlyRate) continue;
    if (!role) throw new Error(`Falta el rol en la fila ${i + 1}.`);
    items.push({ role, hours, hourlyRate });
  }
  return items;
}

export async function createProposalAction(fd: FormData) {
  const user = await requirePermission("propuesta:crear");
  const projectId = Number(fd.get("projectId"));
  const title = String(fd.get("title") ?? "").trim();
  const discountPct = Number(fd.get("discountPct") || 0);
  const notes = String(fd.get("notes") ?? "").trim();
  if (!Number.isInteger(projectId)) throw new Error("Elegí un proyecto.");
  if (!title) throw new Error("El título es obligatorio.");

  const items = readItems(fd);
  if (items.length === 0) throw new Error("La propuesta necesita al menos un ítem.");
  // Valida rangos antes de guardar (lanza RangeError si algo no cierra).
  computeProposalTotals(items, discountPct);

  const id = await createProposal({
    projectId,
    title,
    discountPct,
    notes: notes || null,
    createdByEmail: user.email,
    items,
  });
  revalidatePath("/propuestas");
  redirect(`/propuestas/${id}`);
}
