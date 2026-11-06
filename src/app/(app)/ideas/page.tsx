import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { TicketList, TicketRow } from "@/components/ui/ticket-row";
import { FieldLabel, fieldClass } from "@/components/ui/field";
import { timeAgo } from "@/lib/time-ago";
import { SubmitButton } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { VoteButton } from "@/components/ideas/vote-button";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { IDEA_STATUSES, IDEA_STATUS_LABEL, isIdeaStatus, listIdeas, countIdeasByStatus } from "@/lib/data/ideas";
import { createIdeaAction, voteIdeaAction } from "@/app/(app)/ideas/actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const IDEA_TONE = { abierta: "accent", en_evaluacion: "warning", cerrada: "neutral", convertida: "success" } as const;

async function Content({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const user = await requireUser();
  const params = await searchParams;
  const raw = Array.isArray(params.estado) ? params.estado[0] : params.estado;
  const status = raw && isIdeaStatus(raw) ? raw : undefined;

  const [ideas, counts] = await Promise.all([
    listIdeas({ status, userEmail: user.email }),
    countIdeasByStatus(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Ideas</h1>
          <p className="text-sm text-muted">
            Votá, comentá y, si una idea madura, convertila en propuesta.
          </p>
        </div>
        {can(user.role, "idea:editar") && (
          <Dialog action={createIdeaAction} triggerLabel="Nueva idea" title="Nueva idea" description="Contala en pocas palabras. Podés ampliarla después.">
            <FieldLabel label="Título">
              <input name="title" required maxLength={120} className={fieldClass} />
            </FieldLabel>
            <FieldLabel label="Descripción">
              <textarea name="description" rows={4} className={fieldClass} />
            </FieldLabel>
            <SubmitButton pendingLabel="Guardando idea…" className="w-full">Guardar idea</SubmitButton>
          </Dialog>
        )}
      </div>

      <nav aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
        <FilterChip href="/ideas" active={!status} label={`Todas · ${total}`} />
        {IDEA_STATUSES.map((s) => (
          <FilterChip key={s} href={`/ideas?estado=${s}`} active={status === s} label={`${IDEA_STATUS_LABEL[s]} · ${counts[s]}`} />
        ))}
      </nav>

      {ideas.length === 0 ? (
        <EmptyState title="No hay ideas en este estado" description="Cambiá el filtro o agregá una idea nueva." />
      ) : (
        <div data-tour="ideas">
          <TicketList>
            {ideas.map((i) => (
              <TicketRow
                key={i.id}
                href={`/ideas/${i.id}`}
                initial={i.createdByEmail.charAt(0)}
                title={i.title}
                id={i.id}
                meta={[i.createdByEmail, `${i.comments} comentario${i.comments === 1 ? "" : "s"}`, timeAgo(i.createdAt)]}
                status={{ label: IDEA_STATUS_LABEL[i.status], tone: IDEA_TONE[i.status] }}
                action={<VoteButton ideaId={i.id} votes={i.votes} voted={i.votedByMe} action={voteIdeaAction} size="sm" />}
              />
            ))}
          </TicketList>
        </div>
      )}
    </section>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        active ? "bg-accent text-on-accent" : "border border-line bg-surface text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

export default function IdeasPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

