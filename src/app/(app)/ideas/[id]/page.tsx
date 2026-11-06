import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { Card } from "@/components/ui/card";
import { SubmitButton, buttonBase } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import { IdeaStatusBadge } from "@/components/ideas/status-badge";
import { VoteButton } from "@/components/ideas/vote-button";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { getIdea, IDEA_STATUSES, IDEA_STATUS_LABEL } from "@/lib/data/ideas";
import { commentIdeaAction, setIdeaStatusAction, voteIdeaAction } from "@/app/(app)/ideas/actions";

const input = "w-full rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await requireUser();
  const { id } = await params;
  const ideaId = Number(id);
  if (!Number.isInteger(ideaId)) notFound();

  const idea = await getIdea(ideaId, user.email);
  if (!idea) notFound();

  const canEditStatus = can(user.role, "idea:editar");
  const canPropose = can(user.role, "propuesta:crear") && idea.status !== "convertida";

  return (
    <article className="space-y-6">
      <Link href="/ideas" className="text-sm text-muted hover:text-accent">← Ideas</Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <IdeaStatusBadge status={idea.status} />
          <h1 className="font-display text-3xl tracking-tight">{idea.title}</h1>
          <p className="font-mono text-xs text-muted">
            Por {idea.createdByEmail} · {idea.createdAt.toLocaleDateString("es-AR")}
          </p>
        </div>
        <VoteButton ideaId={idea.id} votes={idea.votes} voted={idea.votedByMe} action={voteIdeaAction} />
      </header>

      {idea.description && (
        <Card>
          <p className="whitespace-pre-line leading-relaxed">{idea.description}</p>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {canPropose && (
          <Link href={`/propuestas?idea=${idea.id}`} className={`${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`}>
            Crear propuesta desde esta idea
          </Link>
        )}
        {idea.linkedProposals.map((p) => (
          <Link key={p.id} href={`/propuestas/${p.id}`} className={`${buttonBase} border border-line bg-surface text-ink`}>
            Ver propuesta: {p.title}
          </Link>
        ))}
      </div>

      {canEditStatus && idea.status !== "convertida" && (
        <Card>
          <ServerForm action={setIdeaStatusAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="ideaId" value={idea.id} />
            <label className="space-y-1 text-sm font-medium">
              Estado
              <select name="status" defaultValue={idea.status} className={`${input} w-auto min-w-56`}>
                {IDEA_STATUSES.filter((s) => s !== "convertida").map((s) => (
                  <option key={s} value={s}>{IDEA_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </label>
            <SubmitButton variant="secondary" pendingLabel="Guardando…">Cambiar estado</SubmitButton>
          </ServerForm>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl">Comentarios · {idea.comments.length}</h2>
        {idea.comments.length === 0 && <p className="text-sm text-muted">Todavía nadie comentó. Sumá la primera opinión.</p>}
        <ul className="space-y-3">
          {idea.comments.map((c) => (
            <li key={c.id}>
              <Card className="space-y-1">
                <p className="font-mono text-xs text-muted">
                  {c.authorEmail} · {c.createdAt.toLocaleDateString("es-AR")}
                </p>
                <p className="whitespace-pre-line text-sm">{c.body}</p>
              </Card>
            </li>
          ))}
        </ul>

        <Card>
          <ServerForm action={commentIdeaAction} className="space-y-3">
            <input type="hidden" name="ideaId" value={idea.id} />
            <label className="block space-y-1 text-sm font-medium">
              Tu comentario
              <textarea name="body" required maxLength={1000} rows={3} className={input} />
            </label>
            <SubmitButton pendingLabel="Publicando…">Comentar</SubmitButton>
          </ServerForm>
        </Card>
      </section>
    </article>
  );
}

export default function IdeaPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}
