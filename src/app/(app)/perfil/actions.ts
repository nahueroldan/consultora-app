"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { claimPerson, requestLink, updateOwnProfile, type OwnProfileInput } from "@/lib/data/profile";
import { fail, ok, safeAction, type ActionResult } from "@/lib/form-result";

export async function claimProfileAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    const personId = Number(fd.get("personId"));
    if (!Number.isInteger(personId)) return fail("El perfil no es válido.");
    const result = await claimPerson(user.email, personId);
    if (!result.ok) return fail(result.error);
    revalidatePath("/");
    return ok();
  });
}

export async function requestLinkAction(): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    await requestLink(user.email);
    revalidatePath("/");
    return ok();
  });
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim() || null;
const flag = (fd: FormData, k: string) => fd.get(k) === "on";

/** Solo el dueño del perfil lo edita. Nadie más, ni siquiera un admin, cambia el perfil ajeno. */
export async function updateOwnProfileAction(fd: FormData): Promise<ActionResult> {
  return safeAction(async () => {
    const user = await requireUser();
    if (!user.personId) return fail("Primero vinculá tu cuenta con tu perfil.");
    const linkedin = str(fd, "linkedin");
    if (linkedin && !/^https?:\/\//.test(linkedin)) return fail("El LinkedIn tiene que empezar con https://");
    const input: OwnProfileInput = {
      position: str(fd, "position"),
      city: str(fd, "city"),
      country: str(fd, "country"),
      linkedin,
      visibility: {
        position: flag(fd, "v_position"),
        city: flag(fd, "v_city"),
        country: flag(fd, "v_country"),
        linkedin: flag(fd, "v_linkedin"),
        skills: flag(fd, "v_skills"),
      },
    };
    await updateOwnProfile(user.personId, input);
    revalidatePath("/");
    revalidatePath(`/directorio/${user.personId}`);
    return ok();
  });
}
