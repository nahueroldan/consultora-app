import { Suspense } from "react";
import { connection } from "next/server";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listIdeas } from "@/lib/data/ideas";
import { createIdeaAction } from "@/app/(app)/ideas/actions";

async function Content() {
  await connection();
  const user = await requireUser();
  const canEdit = can(user.role, "idea:editar");
  const ideas = await listIdeas();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Ideas</h1>

      {canEdit && (
        <form action={createIdeaAction} className="grid gap-3">
          <input name="title" required placeholder="Título" className="rounded-md border px-3 py-2" />
          <textarea name="description" placeholder="Descripción" className="rounded-md border px-3 py-2" />
          <button type="submit" className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-white">Agregar idea</button>
        </form>
      )}

      <ul className="space-y-3">
        {ideas.map((i) => (
          <li key={i.id} className="rounded-md border p-4">
            <p className="font-medium">{i.title}</p>
            {i.description && <p className="text-sm text-zinc-600">{i.description}</p>}
            <p className="mt-1 text-xs text-zinc-500">{i.createdByEmail} · {i.createdAt.toLocaleDateString("es-AR")}</p>
          </li>
        ))}
        {ideas.length === 0 && <li className="text-zinc-500">Todavía no hay ideas.</li>}
      </ul>
    </section>
  );
}

export default function IdeasPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content />
    </Suspense>
  );
}
