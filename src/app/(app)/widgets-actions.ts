"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { saveUserWidgets } from "@/lib/data/preferences";
import { fail, ok, safeAction, type ActionResult } from "@/lib/form-result";
import { widgetsFromForm } from "@/lib/home/parse-form";

export async function saveWidgetsAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    const widgets = widgetsFromForm(fd);
    if (!widgets.some((w) => w.enabled)) return fail("Dejá al menos un widget activo.");
    await saveUserWidgets(user.email, widgets);
    revalidatePath("/");
    return ok();
  });
}
