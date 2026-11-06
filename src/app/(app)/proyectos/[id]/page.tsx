import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IconLink } from "@/components/ui/icon-link";
import { ServerForm } from "@/components/ui/server-form";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { getProject, listConfirmedPeople, PROJECT_STATUSES } from "@/lib/data/projects";
import {
  addMemberAction,
  createSquadAction,
  removeMemberAction,
  setProjectStatusAction,
} from "@/app/(app)/proyectos/actions";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await requireUser();
  const { id } = await params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) notFound();

  const project = await getProject(projectId);
  if (!project) notFound();

  const canEdit = can(user.role, "proyecto:editar");
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

      {canEdit && (
        <ServerForm action={setProjectStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <select name="status" defaultValue={project.status} className="rounded-2xl border border-line bg-cream px-3 py-2 text-sm">
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="rounded-2xl border border-line bg-surface px-4 py-2 text-sm hover:border-accent">Cambiar estado</button>
        </ServerForm>
      )}

      {project.squads.map((squad) => {
        const members = project.members.filter((m) => m.squadId === squad.id);
        return (
          <section key={squad.id} className="space-y-3 rounded-3xl border border-line bg-surface p-5 shadow-sm">
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
                      <button type="submit" className="text-xs text-danger hover:underline">Quitar</button>
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
                <input name="roleInSquad" placeholder="Rol en el squad" className="rounded-2xl border border-line bg-cream px-3 py-2 text-sm" />
                <input name="allocationPct" type="number" min={1} max={100} defaultValue={100} className="rounded-2xl border border-line bg-cream px-3 py-2 text-sm" />
                <button type="submit" className="rounded-2xl bg-accent px-4 py-2 text-sm font-medium text-on-accent hover:bg-accent-hover">Sumar</button>
              </ServerForm>
            )}
          </section>
        );
      })}

      {canSquad && (
        <ServerForm action={createSquadAction} className="flex gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <input name="name" required placeholder="Nombre del nuevo squad" className="rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm" />
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
