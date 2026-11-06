import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { countByStatus, listAreas, listPeople, listSkillNames, parseDirectoryFilters } from "@/lib/data/people";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Content({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const user = await requireUser();
  const showPending = can(user.role, "usuario:gestionar");
  const filters = parseDirectoryFilters(await searchParams, showPending);

  const [people, areas, skills, counts] = await Promise.all([
    listPeople(filters),
    listAreas(),
    listSkillNames(),
    showPending ? countByStatus() : Promise.resolve(null),
  ]);

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Directorio</h1>
        {counts && (
          <p className="text-sm text-zinc-500">
            Confirmados: {counts.confirmed ?? 0} · Pendientes: {counts.pending ?? 0}
          </p>
        )}
      </div>

      <form className="grid gap-3 md:grid-cols-4">
        <input name="q" defaultValue={filters.q ?? ""} placeholder="Nombre o puesto" className="rounded-md border px-3 py-2" />
        <select name="area" defaultValue={filters.area ?? ""} className="rounded-md border px-3 py-2">
          <option value="">Todas las áreas</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select name="skill" defaultValue={filters.skill ?? ""} className="rounded-md border px-3 py-2">
          <option value="">Todas las skills</option>
          {skills.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-white">Filtrar</button>
      </form>

      <table className="w-full text-left text-sm">
        <thead className="border-b text-zinc-500">
          <tr>
            <th className="py-2">Nombre</th>
            <th>Área</th>
            <th>Puesto</th>
            <th>Ciudad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {people.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="py-2">
                <Link href={`/directorio/${p.id}`} className="hover:underline">
                  {p.firstName} {p.lastName}
                </Link>
                {p.needsReview && <span className="ml-2 text-xs text-amber-600">revisar duplicado</span>}
              </td>
              <td>{p.area ?? "—"}</td>
              <td>{p.position ?? "—"}</td>
              <td>{p.city ?? "—"}</td>
              <td>{p.status === "confirmed" ? "Confirmado" : "Pendiente"}</td>
            </tr>
          ))}
          {people.length === 0 && (
            <tr><td colSpan={5} className="py-6 text-center text-zinc-500">Sin resultados.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export default function DirectorioPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
