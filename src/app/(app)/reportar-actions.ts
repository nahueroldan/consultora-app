"use server";

import { requireUser } from "@/lib/auth/session";
import { fail, ok, requiredText, safeAction, type ActionResult } from "@/lib/form-result";
import { buildIssueBody, createIssue } from "@/lib/github/issues";

/** Crea un issue en GitHub con el problema reportado desde la app. */
export async function reportIssueAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    const title = requiredText(fd.get("title"), "El título");
    if ("error" in title) return fail(title.error);
    if (title.value.length > 120) return fail("El título no puede pasar de 120 caracteres.");
    const description = requiredText(fd.get("description"), "La descripción");
    if ("error" in description) return fail(description.error);
    if (description.value.length > 4000) return fail("La descripción no puede pasar de 4000 caracteres.");
    const page = String(fd.get("page") ?? "").slice(0, 200) || "desconocida";

    try {
      await createIssue({
        title: `[app] ${title.value}`,
        body: buildIssueBody({ description: description.value, reporterEmail: user.email, role: user.role, page }),
        labels: ["bug", "reportado-desde-app"],
      });
    } catch (err) {
      // No mostramos el detalle técnico al usuario; queda en el log del servidor.
      console.error("No se pudo crear el issue:", err instanceof Error ? err.message : err);
      return fail("No pudimos enviar el reporte. Probá de nuevo más tarde.");
    }
    return ok();
  });
}
