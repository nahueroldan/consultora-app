import Link from "next/link";
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
    <article className="space-y-8">
      <Link href="/proyectos" className="text-sm text-zinc-500 hover:underline">← Proyectos</Link>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-zinc-600">{project.client ?? "Sin cliente"} · {project.status}</p>
        {project.description && <p className="text-sm">{project.description}</p>}
      </header>

      {canEdit && (
        <form action={setProjectStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <select name="status" defaultValue={project.status} className="rounded-md border px-2 py-1">
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="rounded-md border px-3 py-1 text-sm">Cambiar estado</button>
        </form>
      )}

      {project.squads.map((squad) => {
        const members = project.members.filter((m) => m.squadId === squad.id);
        return (
          <section key={squad.id} className="space-y-3 rounded-md border p-4">
            <h2 className="font-semibold">Squad: {squad.name}</h2>
            <ul className="space-y-2 text-sm">
              {members.map((m) => (
                <li key={m.personId} className="flex items-center gap-3">
                  <Link href={`/directorio/${m.personId}`} className="hover:underline">
                    {m.firstName} {m.lastName}
                  </Link>
                  <span className="text-zinc-500">{m.roleInSquad ?? m.position ?? ""} · {m.allocationPct}%</span>
                  {canSquad && (
                    <form action={removeMemberAction} className="ml-auto">
                      <input type="hidden" name="squadId" value={squad.id} />
                      <input type="hidden" name="personId" value={m.personId} />
                      <button type="submit" className="text-xs text-red-600">Quitar</button>
                    </form>
                  )}
                </li>
              ))}
              {members.length === 0 && <li className="text-zinc-500">Sin integrantes.</li>}
            </ul>

            {canSquad && (
              <form action={addMemberAction} className="grid gap-2 md:grid-cols-5">
                <input type="hidden" name="squadId" value={squad.id} />
                <select name="personId" required className="rounded-md border px-2 py-1 md:col-span-2">
                  <option value="">Elegir persona confirmada</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.position ? `— ${p.position}` : ""}</option>
                  ))}
                </select>
                <input name="roleInSquad" placeholder="Rol en el squad" className="rounded-md border px-2 py-1" />
                <input name="allocationPct" type="number" min={1} max={100} defaultValue={100} className="rounded-md border px-2 py-1" />
                <button type="submit" className="rounded-md bg-zinc-900 px-3 py-1 text-white">Sumar</button>
              </form>
            )}
          </section>
        );
      })}

      {canSquad && (
        <form action={createSquadAction} className="flex gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <input name="name" required placeholder="Nombre del nuevo squad" className="rounded-md border px-3 py-2" />
          <button type="submit" className="rounded-md border px-3 py-2">Crear squad</button>
        </form>
      )}
    </article>
  );
}

export default function ProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}
