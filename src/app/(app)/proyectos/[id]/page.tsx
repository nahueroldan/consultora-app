import { cardSurface } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, Pencil, UserMinus, X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { Dialog } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/button";
import { updateProjectAction } from "@/app/(app)/proyectos/actions";
import { IconLink } from "@/components/ui/icon-link";
import { ServerForm } from "@/components/ui/server-form";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { getProject, listConfirmedPeople, PROJECT_STATUSES } from "@/lib/data/projects";
import { listInterests, myInterest } from "@/lib/data/interests";
import { decideInterestAction, expressInterestAction } from "@/app/(app)/proyectos/interest-actions";
import {
  addMemberAction,
  createSquadAction,
  removeMemberAction,
  setProjectStatusAction,
} from "@/app/(app)/proyectos/actions";
import { fieldClass as input } from "@/components/ui/field";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await requireUser();
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();

  const project = await getProject(projectId);
  if (!project) notFound();

  const canEdit = can(user.role, "proyecto:editar");
  const myStatus = await myInterest(projectId, user.email);
  const interests = canEdit ? await listInterests(projectId) : [];
  const canSquad = can(user.role, "squad:editar");
  const people = canSquad ? await listConfirmedPeople() : [];

  return (
    <article className="space-y-6">
      <IconLink href="/proyectos" label="Volver a proyectos" Icon={ArrowLeft} />
      <header className="space-y-1">
        <h1 className="font-display text-3xl tracking-tight">{project.name}</h1>
        <p className="text-muted">{project.client ?? "Sin cliente"} · {project.status}</p>
        {project.description && <p className="text-sm">{project.description}</p>}
      </header>

      {project.url && (
        <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2 text-sm hover:border-accent">
          <ExternalLink size={16} aria-hidden /> Abrir producto
        </a>
      )}

      {canEdit && (
        <Dialog action={updateProjectAction} triggerLabel="Editar proyecto" triggerIcon={Pencil} title="Editar proyecto" description="Cambiá los datos del proyecto.">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Nombre
            <input name="name" required defaultValue={project.name} className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Cliente
            <input name="client" defaultValue={project.client ?? ""} className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Enlace del producto o sitio
            <input name="url" type="url" defaultValue={project.url ?? ""} placeholder="https://…" className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Descripción
            <textarea name="description" rows={3} defaultValue={project.description ?? ""} className={input} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Estado
            <select name="status" defaultValue={project.status} className={input}>
              {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <SubmitButton pendingLabel="Guardando…" className="w-full">Guardar cambios</SubmitButton>
        </Dialog>
      )}

      {canEdit && (
        <ServerForm action={setProjectStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <select name="status" defaultValue={project.status} className={`${input} w-auto min-w-40`}>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="rounded-2xl border border-line bg-surface px-4 py-2 text-sm hover:border-accent">Cambiar estado</button>
        </ServerForm>
      )}

      <section className={`space-y-3 p-5 ${cardSurface}`}>
        <h2 className="font-display text-lg">Quiero sumarme</h2>
        {myStatus ? (
          <p className="text-sm text-muted">
            Ya pediste sumarte.{" "}
            <span className="font-mono text-xs">
              {myStatus === "pendiente" ? "pendiente de respuesta" : myStatus}
            </span>
          </p>
        ) : (
          <ServerForm action={expressInterestAction}>
            <input type="hidden" name="projectId" value={project.id} />
            <SubmitButton pendingLabel="Enviando…">Quiero sumarme a este proyecto</SubmitButton>
          </ServerForm>
        )}

        {canEdit && (
          <div className="space-y-2 pt-3">
            <h3 className="text-sm font-semibold">Interesados · {interests.length}</h3>
            {interests.length === 0 && <p className="text-sm text-muted">Todavía nadie pidió sumarse.</p>}
            <ul className="space-y-2">
              {interests.map((i) => (
                <li key={i.userEmail} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {i.firstName ? `${i.firstName} ${i.lastName}` : i.userEmail}
                    </p>
                    <p className="font-mono text-xs text-muted">
                      {i.status}{i.personId ? "" : " · sin perfil vinculado"}
                    </p>
                  </div>
                  {i.status === "pendiente" && (
                    <div className="flex gap-2">
                      <ServerForm action={decideInterestAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="userEmail" value={i.userEmail} />
                        <input type="hidden" name="decision" value="aceptada" />
                        <Tooltip label="Aceptar"><SubmitButton variant="secondary" pendingLabel="…" className="size-10 px-0" aria-label="Aceptar"><Check size={16} aria-hidden /></SubmitButton></Tooltip>
                      </ServerForm>
                      <ServerForm action={decideInterestAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="userEmail" value={i.userEmail} />
                        <input type="hidden" name="decision" value="rechazada" />
                        <Tooltip label="Rechazar"><SubmitButton variant="secondary" pendingLabel="…" className="size-10 px-0" aria-label="Rechazar"><X size={16} aria-hidden /></SubmitButton></Tooltip>
                      </ServerForm>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted">Para sumar a un aceptado, primero tiene que estar vinculado a su perfil. Después lo agregás a un squad.</p>
          </div>
        )}
      </section>

      {project.squads.map((squad) => {
        const members = project.members.filter((m) => m.squadId === squad.id);
        return (
          <section key={squad.id} className={`space-y-3 p-5 ${cardSurface}`}>
            <h2 className="font-display text-lg">Squad: {squad.name}</h2>
            <ul className="space-y-2 text-sm">
              {members.map((m) => (
                <li key={m.personId} className="flex items-center gap-3">
                  <Link href={`/directorio/${m.personId}`} className="hover:underline">
                    {m.firstName} {m.lastName}
                  </Link>
                  <span className="font-mono text-xs text-muted">{m.roleInSquad ?? m.position ?? ""} · {m.allocationPct}%</span>
                  {canSquad && (
                    <ServerForm action={removeMemberAction} className="ml-auto">
                      <input type="hidden" name="squadId" value={squad.id} />
                      <input type="hidden" name="personId" value={m.personId} />
                      <Tooltip label="Quitar del squad">
                        <button
                          type="submit"
                          aria-label={`Quitar a ${m.firstName} del squad`}
                          className="inline-flex size-8 items-center justify-center rounded-xl border border-line text-danger transition hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          <UserMinus size={15} aria-hidden />
                        </button>
                      </Tooltip>
                    </ServerForm>
                  )}
                </li>
              ))}
              {members.length === 0 && <li className="text-muted">Sin integrantes.</li>}
            </ul>

            {canSquad && (
              <ServerForm action={addMemberAction} className="grid gap-2 md:grid-cols-5">
                <input type="hidden" name="squadId" value={squad.id} />
                <select name="personId" required className="rounded-2xl border border-line bg-cream px-3 py-2 text-sm md:col-span-2">
                  <option value="">Elegir persona confirmada</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.position ? `— ${p.position}` : ""}</option>
                  ))}
                </select>
                <input name="roleInSquad" placeholder="Rol en el squad" className={input} />
                <input name="allocationPct" type="number" min={1} max={100} defaultValue={100} className={input} />
                <button type="submit" className="rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover">Sumar</button>
              </ServerForm>
            )}
          </section>
        );
      })}

      {canSquad && (
        <ServerForm action={createSquadAction} className="flex gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <input name="name" required placeholder="Nombre del nuevo squad" className={`${input} w-auto min-w-64`} />
          <button type="submit" className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-hover">Crear squad</button>
        </ServerForm>
      )}
    </article>
  );
}

export default function ProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}
