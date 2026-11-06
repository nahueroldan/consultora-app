import { Suspense } from "react";
import { connection } from "next/server";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { SubmitButton } from "@/components/ui/button";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Ideas</h1>
          <p className="text-sm text-muted">Propuestas de producto y mejoras para el equipo.</p>
        </div>
        {canEdit && (
          <Dialog triggerLabel="Nueva idea" title="Nueva idea" description="Contala en pocas palabras. Se puede ampliar después.">
            {(close) => (
              <form
                action={async (fd) => {
                  await createIdeaAction(fd);
                  close();
                }}
                className="space-y-4"
              >
                <label className="block space-y-1 text-sm font-medium">
                  Título
                  <input name="title" required className="w-full rounded-xl border border-line px-3 py-2 font-normal" />
                </label>
                <label className="block space-y-1 text-sm font-medium">
                  Descripción
                  <textarea name="description" rows={4} className="w-full rounded-xl border border-line px-3 py-2 font-normal" />
                </label>
                <SubmitButton pendingLabel="Guardando idea…">Guardar idea</SubmitButton>
              </form>
            )}
          </Dialog>
        )}
      </div>

      {ideas.length === 0 ? (
        <EmptyState
          title="Todavía no hay ideas"
          description="Una idea puede convertirse en proyecto. Empezá por la primera."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((i) => (
            <li key={i.id}>
              <Card className="flex h-full flex-col gap-3">
                <h2 className="font-semibold">{i.title}</h2>
                {i.description && <p className="line-clamp-3 text-sm text-muted">{i.description}</p>}
                <p className="mt-auto text-xs text-muted">
                  {i.createdByEmail} · {i.createdAt.toLocaleDateString("es-AR")}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function IdeasPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
      <Content />
    </Suspense>
  );
}
