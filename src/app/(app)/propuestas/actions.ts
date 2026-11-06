"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/session";
import { createProposal } from "@/lib/data/proposals";
import { computeProposalTotals, type ProposalItem } from "@/lib/proposals/total";
import { fail, ok, requiredText, safeAction, type ActionResult } from "@/lib/form-result";

/** Lee las filas de items del formulario (hasta 8). Ignora filas vacías. */
function readItems(fd: FormData): { items: ProposalItem[] } | { error: string } {
  const items: ProposalItem[] = [];
  for (let i = 0; i < 8; i++) {
    const role = String(fd.get(`role_${i}`) ?? "").trim();
    const hours = Number(fd.get(`hours_${i}`) ?? 0);
    const hourlyRate = Number(fd.get(`rate_${i}`) ?? 0);
    if (!role && !hours && !hourlyRate) continue;
    if (!role) return { error: `Falta el rol en la fila ${i + 1}.` };
    items.push({ role, hours, hourlyRate });
  }
  return { items };
}

/** Devuelve error si falla la validación; si sale bien, redirige a la propuesta creada. */
export async function createProposalAction(fd: FormData): Promise<ActionResult> {
  let createdId: number | null = null;
  const result = await safeAction(async () => {
    const user = await requirePermission("propuesta:crear");
    const projectId = Number(fd.get("projectId"));
    const title = requiredText(fd.get("title"), "El título");
    const discountPct = Number(fd.get("discountPct") || 0);
    const notes = String(fd.get("notes") ?? "").trim();
    if (!Number.isInteger(projectId)) return fail("Elegí un proyecto.");
    if ("error" in title) return fail(title.error);

    const parsed = readItems(fd);
    if ("error" in parsed) return fail(parsed.error);
    if (parsed.items.length === 0) return fail("La propuesta necesita al menos un ítem con horas.");
    try {
      computeProposalTotals(parsed.items, discountPct);
    } catch (e) {
      return fail(e instanceof Error ? e.message : "Los valores no son válidos.");
    }

    const id = await createProposal({
      projectId,
      title: title.value,
      discountPct,
      notes: notes || null,
      createdByEmail: user.email,
      items: parsed.items,
    });
    revalidatePath("/propuestas");
    createdId = id;
    return ok();
  });
  if (createdId !== null) redirect(`/propuestas/${createdId}`);
  return result;
}
