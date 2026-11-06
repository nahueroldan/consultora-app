import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { assertCan, type Action, type Role } from "@/lib/auth/roles";

export type CurrentUser = {
  email: string;
  role: Role | null;
  name: string | null;
  personId: number | null;
};

/** Devuelve el usuario actual o redirige a /login. Úsalo en páginas y acciones. */
export async function requireUser(): Promise<CurrentUser> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login");
  return {
    email,
    role: (session?.user?.role as Role | null) ?? null,
    name: session?.user?.name ?? null,
    personId: session?.user?.personId ?? null,
  };
}

/** Exige un permiso; si no lo tiene, lanza ForbiddenError (la acción o página lo muestra). */
export async function requirePermission(action: Action): Promise<CurrentUser> {
  const user = await requireUser();
  assertCan(user.role, action);
  return user;
}
