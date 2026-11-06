import { Suspense } from "react";
import { connection } from "next/server";
import { FolderKanban, Users } from "lucide-react";
import { Badge, LinkCard } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ServerForm } from "@/components/ui/server-form";
import { SubmitButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/motion";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listProjects, PROJECT_STATUSES } from "@/lib/data/projects";
import { createProjectAction } from "@/app/(app)/proyectos/actions";

const input = "w-full rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent";

const TONE = { propuesta: "warning", activo: "success", cerrado: "neutral" } as const;

async function Content() {
  await connection();
  const user = await requireUser();
  const canEdit = can(user.role, "proyecto:editar");
  const projects = await listProjects();

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Proyectos</h1>
          <p className="text-sm text-muted">Cada proyecto tiene sus squads y sus propuestas.</p>
        </div>
        {canEdit && (
          <Dialog triggerLabel="Nuevo proyecto" title="Nuevo proyecto" description="Solo el nombre es obligatorio.">
            {() => (
              <ServerForm action={createProjectAction} className="space-y-4">
                <label className="block space-y-1 text-sm font-medium">
                  Nombre
                  <input name="name" required className={input} />
                </label>
                <label className="block space-y-1 text-sm font-medium">
                  Cliente
                  <input name="client" className={input} />
                </label>
                <label className="block space-y-1 text-sm font-medium">
                  Descripción
                  <textarea name="description" rows={3} className={input} />
                </label>
                <label className="block space-y-1 text-sm font-medium">
                  Estado
                  <select name="status" defaultValue="propuesta" className={input}>
                    {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <SubmitButton pendingLabel="Creando proyecto…" className="w-full">Crear proyecto</SubmitButton>
              </ServerForm>
            )}
          </Dialog>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState title="Todavía no hay proyectos" description="Creá el primero para armar squads y propuestas." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.id}>
              <FadeIn delay={Math.min(i * 0.04, 0.3)}>
                <LinkCard href={`/proyectos/${p.id}`} className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                      <FolderKanban size={20} aria-hidden />
                    </span>
                    <Badge tone={TONE[p.status]}>{p.status}</Badge>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{p.name}</h2>
                    <p className="truncate text-sm text-muted">{p.client ?? "Sin cliente"}</p>
                  </div>
                  <p className="mt-auto flex items-center gap-1.5 font-mono text-xs text-muted">
                    <Users size={14} aria-hidden /> {p.squads} squad{p.squads === 1 ? "" : "s"}
                  </p>
                </LinkCard>
              </FadeIn>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ProyectosPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
      <Content />
    </Suspense>
  );
}
