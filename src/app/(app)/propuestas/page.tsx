import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Badge, Card } from "@/components/ui/card";
import { ProposalWizard } from "@/components/proposals/proposal-wizard";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listProjectOptions, listProposals } from "@/lib/data/proposals";
import { getIdeaBasics } from "@/lib/data/ideas";
import { createProposalAction } from "@/app/(app)/propuestas/actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function Content({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = await searchParams;
  const ideaRaw = Array.isArray(params.idea) ? params.idea[0] : params.idea;
  const ideaId = Number(ideaRaw);
  const idea = Number.isInteger(ideaId) && ideaId > 0 ? await getIdeaBasics(ideaId) : null;
  const user = await requireUser();
  const canCreate = can(user.role, "propuesta:crear");
  const [proposals, projects] = await Promise.all([listProposals(), listProjectOptions()]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Propuestas</h1>
          <p className="text-sm text-muted">Armá el equipo por roles y descargá el PDF para el cliente.</p>
        </div>
        {canCreate && (
          <div data-tour="propuestas">
          <ProposalWizard
            projects={projects}
            action={createProposalAction}
            initialIdea={idea ? { id: idea.id, title: idea.title } : null}
          />
          </div>
        )}
      </div>

      {proposals.length === 0 ? (
        <EmptyState title="Todavía no hay propuestas" description="Creá la primera desde el botón de arriba." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proposals.map((p) => (
            <li key={p.id}>
              <Link href={`/propuestas/${p.id}`} className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-accent">
                <Card className="flex h-full flex-col gap-3 transition hover:border-accent hover:shadow">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{p.title}</h2>
                    {p.discountPct > 0 && <Badge tone="warning">-{p.discountPct}%</Badge>}
                  </div>
                  <p className="text-sm text-muted">{p.projectName}</p>
                  <p className="mt-auto text-xs text-muted">{p.createdAt.toLocaleDateString("es-AR")}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function PropuestasPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
