// Resultado de una acción de formulario. Las acciones devuelven errores esperados
// en vez de lanzarlos: en producción Next oculta el mensaje de los errores lanzados.

export type ActionResult = { ok: true } | { ok: false; error: string };

export const ok = (): ActionResult => ({ ok: true });
export const fail = (error: string): ActionResult => ({ ok: false, error });

/** Texto obligatorio: quita espacios y devuelve null si queda vacío. */
export function requiredText(value: FormDataEntryValue | null, label: string): { value: string } | { error: string } {
  const v = String(value ?? "").trim();
  return v ? { value: v } : { error: `${label} es obligatorio.` };
}

/** Ejecuta una acción y convierte errores inesperados en un mensaje. Los redirects se propagan. */
export async function safeAction(fn: () => Promise<ActionResult>): Promise<ActionResult> {
  try {
    return await fn();
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    if (err instanceof Error && err.name === "ForbiddenError") {
      return fail("No tenés permiso para hacer esta acción.");
    }
    console.error("Error en acción de formulario:", err instanceof Error ? err.message : err);
    return fail("No se pudo guardar. Revisá la conexión y probá de nuevo.");
  }
}
