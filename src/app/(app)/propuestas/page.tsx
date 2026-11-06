import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listProjectOptions, listProposals } from "@/lib/data/proposals";
import { createProposalAction } from "@/app/(app)/propuestas/actions";

async function Content() {
  await connection();
  const user = await requireUser();
  const canCreate = can(user.role, "propuesta:crear");
  const [proposals, projects] = await Promise.all([listProposals(), listProjectOptions()]);

  return (
    <section className="space-y-8">
      <h1 className="text-2xl font-semibold">Propuestas</h1>

      {canCreate && (
        <form action={createProposalAction} className="space-y-3 rounded-md border p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <select name="projectId" required className="rounded-md border px-3 py-2">
              <option value="">Elegí un proyecto</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input name="title" required placeholder="Título de la propuesta" className="rounded-md border px-3 py-2 md:col-span-2" />
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr><th>Rol</th><th>Horas</th><th>Tarifa USD/h</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  <td className="pr-2"><input name={`role_${i}`} className="w-full rounded-md border px-2 py-1" /></td>
                  <td className="pr-2"><input name={`hours_${i}`} type="number" min={0} className="w-28 rounded-md border px-2 py-1" /></td>
                  <td><input name={`rate_${i}`} type="number" min={0} step="0.01" className="w-28 rounded-md border px-2 py-1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="grid gap-3 md:grid-cols-4">
            <input name="discountPct" type="number" min={0} max={100} defaultValue={0} placeholder="Descuento %" className="rounded-md border px-3 py-2" />
            <textarea name="notes" placeholder="Notas para el cliente" className="rounded-md border px-3 py-2 md:col-span-3" />
          </div>
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-white">Crear propuesta</button>
        </form>
      )}

      <table className="w-full text-left text-sm">
        <thead className="border-b text-zinc-500">
          <tr><th className="py-2">Propuesta</th><th>Proyecto</th><th>Descuento</th><th>Fecha</th></tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2"><Link href={`/propuestas/${p.id}`} className="hover:underline">{p.title}</Link></td>
              <td>{p.projectName}</td>
              <td>{p.discountPct}%</td>
              <td>{p.createdAt.toLocaleDateString("es-AR")}</td>
            </tr>
          ))}
          {proposals.length === 0 && (
            <tr><td colSpan={4} className="py-6 text-center text-zinc-500">Todavía no hay propuestas.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default function PropuestasPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content />
    </Suspense>
  );
}
