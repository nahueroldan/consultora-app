"use server";

import { requireUser } from "@/lib/auth/session";
import { markTourClosed } from "@/lib/data/users";
import { ok, safeAction, type ActionResult } from "@/lib/form-result";

/** Marca el recorrido como cerrado, sea terminado u omitido. */
export async function closeTourAction(): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    await markTourClosed(user.email);
    return ok();
  });
}
