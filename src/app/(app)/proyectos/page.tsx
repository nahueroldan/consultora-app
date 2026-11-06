import { Suspense } from "react";
import { connection } from "next/server";


import { Dialog } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { TicketList, TicketRow } from "@/components/ui/ticket-row";
import { CardSkeleton } from "@/components/ui/skeleton";

import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listProjects, PROJECT_STATUSES } from "@/lib/data/projects";
import { createProjectAction } from "@/app/(app)/proyectos/actions";
import { fieldClass as input } from "@/components/ui/field";


const PROJECT_TONE = { propuesta: "warning", activo: "success", cerrado: "neutral" } as const;

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
          <div data-tour="proyectos">
          <Dialog action={createProjectAction} triggerLabel="Nuevo proyecto" title="Nuevo proyecto" description="Solo el nombre es obligatorio.">
            
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Nombre
                  <input name="name" required className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Cliente
                  <input name="client" className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Enlace del producto o sitio (opcional)
                  <input name="url" type="url" placeholder="https://…" className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Descripción
                  <textarea name="description" rows={3} className={input} />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Estado
                  <select name="status" defaultValue="propuesta" className={input}>
                    {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <SubmitButton pendingLabel="Creando proyecto…" className="w-full">Crear proyecto</SubmitButton>
              
          </Dialog>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState title="Todavía no hay proyectos" description="Creá el primero para armar squads y propuestas." />
      ) : (
        <TicketList>
          {projects.map((p) => (
            <TicketRow
              key={p.id}
              href={`/proyectos/${p.id}`}
              initial={p.name.charAt(0)}
              title={p.name}
              meta={[p.client ?? "Sin cliente", `${p.squads} squad${p.squads === 1 ? "" : "s"}`]}
              status={{ label: p.status, tone: PROJECT_TONE[p.status] }}
            />
          ))}
        </TicketList>
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
