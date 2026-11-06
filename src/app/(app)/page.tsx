import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Badge, Card, LinkCard } from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { listIdeas } from "@/lib/data/ideas";
import { listProposals } from "@/lib/data/proposals";
import { listProjects } from "@/lib/data/projects";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";

async function RecentProposals() {
  await connection();
  const proposals = (await listProposals()).slice(0, 3);
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Propuestas recientes</h2>
        <Link href="/propuestas" className="text-sm text-accent hover:underline">Ver todas</Link>
      </div>
      {proposals.length === 0 ? (
        <EmptyState title="Todavía no hay propuestas" actionHref="/propuestas" actionLabel="Crear propuesta" />
      ) : (
        <ul className="divide-y divide-line">
          {proposals.map((p) => (
            <li key={p.id}>
              <Link href={`/propuestas/${p.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-accent">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="block truncate text-xs text-muted">{p.projectName}</span>
                </span>
                {p.discountPct > 0 && <Badge tone="warning">-{p.discountPct}%</Badge>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

async function RecentIdeas() {
  await connection();
  const user = await requireUser();
  const ideas = (await listIdeas({ userEmail: user.email, limit: 3 }));
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Ideas recientes</h2>
        <Link href="/ideas" className="text-sm text-accent hover:underline">Ver todas</Link>
      </div>
      {ideas.length === 0 ? (
        <EmptyState title="Todavía no hay ideas" actionHref="/ideas" actionLabel="Agregar idea" />
      ) : (
        <ul className="space-y-3">
          {ideas.map((i) => (
            <li key={i.id}>
              <p className="font-medium">{i.title}</p>
              {i.description && <p className="line-clamp-2 text-sm text-muted">{i.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

async function Quick() {
  await connection();
  const user = await requireUser();
  const projects = await listProjects();
  const activos = projects.filter((p) => p.status === "activo").length;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <LinkCard href="/proyectos">
        <p className="text-sm text-muted">Proyectos activos</p>
        <p className="mt-1 text-3xl font-semibold">{activos}</p>
      </LinkCard>
      {can(user.role, "propuesta:crear") ? (
        <LinkCard href="/propuestas">
          <p className="font-semibold text-accent">Nueva propuesta</p>
          <p className="mt-1 text-sm text-muted">Armá el equipo por roles y descargá el PDF.</p>
        </LinkCard>
      ) : (
        <LinkCard href="/directorio">
          <p className="font-semibold">Directorio</p>
          <p className="mt-1 text-sm text-muted">Buscá personas por skill o área.</p>
        </LinkCard>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Inicio</h1>
      <Suspense fallback={<CardSkeleton lines={3} />}>
        <Quick />
      </Suspense>
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<CardSkeleton lines={4} />}>
          <RecentProposals />
        </Suspense>
        <Suspense fallback={<CardSkeleton lines={4} />}>
          <RecentIdeas />
        </Suspense>
      </div>
    </div>
  );
}
