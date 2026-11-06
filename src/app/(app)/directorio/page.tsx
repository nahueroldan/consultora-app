import { Suspense } from "react";
import { connection } from "next/server";
import { AreaExplorer } from "@/components/directory/area-explorer";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { countByStatus, listAreaSummary } from "@/lib/data/people";

async function Content() {
  await connection();
  const user = await requireUser();
  const showPending = can(user.role, "usuario:gestionar");
  const [areas, counts] = await Promise.all([
    listAreaSummary(showPending),
    showPending ? countByStatus() : Promise.resolve(null),
  ]);

  return (
    <section data-tour="directorio" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Directorio</h1>
          <p className="text-sm text-muted">Elegí un área para ver a sus integrantes.</p>
        </div>
        {counts && (
          <p className="font-mono text-xs text-muted">
            confirmados {counts.confirmed ?? 0} · pendientes {counts.pending ?? 0}
          </p>
        )}
      </div>

      {areas.length === 0 ? (
        <EmptyState title="Todavía no hay personas en el directorio" />
      ) : (
        <AreaExplorer areas={areas} />
      )}
    </section>
  );
}

export default function DirectorioPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
      <Content />
    </Suspense>
  );
}
