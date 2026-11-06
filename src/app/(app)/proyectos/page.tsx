import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listProjects, PROJECT_STATUSES } from "@/lib/data/projects";
import { createProjectAction } from "@/app/(app)/proyectos/actions";

async function Content() {
  await connection();
  const user = await requireUser();
  const canEdit = can(user.role, "proyecto:editar");
  const projects = await listProjects();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Proyectos</h1>

      {canEdit && (
        <form action={createProjectAction} className="grid gap-3 md:grid-cols-2">
          <input name="name" required placeholder="Nombre del proyecto" className="rounded-md border px-3 py-2" />
          <input name="client" placeholder="Cliente" className="rounded-md border px-3 py-2" />
          <textarea name="description" placeholder="Descripción" className="rounded-md border px-3 py-2 md:col-span-2" />
          <select name="status" defaultValue="propuesta" className="rounded-md border px-3 py-2">
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-white">Crear proyecto</button>
        </form>
      )}

      <table className="w-full text-left text-sm">
        <thead className="border-b text-zinc-500">
          <tr><th className="py-2">Proyecto</th><th>Cliente</th><th>Estado</th><th>Squads</th></tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">
                <Link href={`/proyectos/${p.id}`} className="hover:underline">{p.name}</Link>
              </td>
              <td>{p.client ?? "—"}</td>
              <td>{p.status}</td>
              <td>{p.squads}</td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr><td colSpan={4} className="py-6 text-center text-zinc-500">Todavía no hay proyectos.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default function ProyectosPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content />
    </Suspense>
  );
}
