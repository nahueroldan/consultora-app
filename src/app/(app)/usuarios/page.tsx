import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Mail, UserRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ServerForm } from "@/components/ui/server-form";
import { SubmitButton } from "@/components/ui/button";
import { CardSkeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion";
import { can, ROLES } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/users";
import { addUserAction, updateUserAction } from "@/app/(app)/usuarios/actions";

const input = "w-full rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent";

async function Content() {
  await connection();
  const user = await requireUser();
  // Solo admin: cualquier otro rol vuelve al inicio, sin ver la página.
  if (!can(user.role, "usuario:gestionar")) {
    redirect("/");
  }
  const users = await listUsers();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Usuarios</h1>
          <p className="text-sm text-muted">Cuentas con acceso, sus roles y la persona vinculada.</p>
        </div>
        <div data-tour="usuarios">
        <Dialog action={addUserAction} triggerLabel="Dar de alta" title="Dar de alta un usuario" description="La persona entra con su cuenta de Google.">
          
              <label className="block space-y-1 text-sm font-medium">
                Email
                <input name="email" type="email" required placeholder="email@ejemplo.com" className={input} />
              </label>
              <label className="block space-y-1 text-sm font-medium">
                Rol
                <select name="role" defaultValue="colaborador" className={input}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <SubmitButton pendingLabel="Guardando…" className="w-full">Dar de alta</SubmitButton>
            
        </Dialog>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u, i) => (
          <li key={u.id}>
            <FadeIn delay={Math.min(i * 0.04, 0.3)}>
              <Card className="flex h-full flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <UserRound size={20} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{u.email}</p>
                    <p className="truncate text-xs text-muted">
                      <Mail size={12} aria-hidden className="mr-1 inline" />
                      {u.personName ? `${u.personName} ${u.personLast}` : "sin persona vinculada"}
                    </p>
                  </div>
                </div>
                <ServerForm action={updateUserAction} className="mt-auto grid gap-2">
                  <input type="hidden" name="id" value={u.id} />
                  <label className="space-y-1 text-xs font-medium text-muted">
                    Rol
                    <select name="role" defaultValue={u.role} className={input}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs font-medium text-muted">
                    ID de persona
                    <input name="personId" type="number" defaultValue={u.personId ?? ""} placeholder="Ej.: 42" className={input} />
                  </label>
                  <SubmitButton variant="secondary" pendingLabel="Guardando…">Guardar</SubmitButton>
                </ServerForm>
              </Card>
            </FadeIn>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
      <Content />
    </Suspense>
  );
}
