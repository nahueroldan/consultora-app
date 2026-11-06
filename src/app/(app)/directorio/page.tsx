import { Suspense } from "react";
import { connection } from "next/server";
import { AreaExplorer } from "@/components/directory/area-explorer";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { countByStatus, listAreaSummary } from "@/lib/data/people";

/**
 * La cabecera y el contenedor del paso del tour existen desde el primer render;
 * los datos (contadores y áreas) llegan en streaming dentro de cada parte.
 */
export default function DirectorioPage() {
  return (
    <section data-tour="directorio" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Directorio</h1>
          <p className="text-sm text-muted">Elegí un área para ver a sus integrantes.</p>
        </div>
        <Suspense fallback={<span className="h-4 w-48 animate-pulse rounded bg-line/60" />}>
          <Counts />
        </Suspense>
      </div>
      <div className="min-h-40">
        <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
          <Areas />
        </Suspense>
      </div>
    </section>
  );
}

async function Counts() {
  await connection();
  const user = await requireUser();
  if (!can(user.role, "usuario:gestionar")) return null;
  const counts = await countByStatus();
  return (
    <p className="font-mono text-xs text-muted">
      confirmados {counts.confirmed ?? 0} · pendientes {counts.pending ?? 0}
    </p>
  );
}

async function Areas() {
  await connection();
  const user = await requireUser();
  const areas = await listAreaSummary(can(user.role, "usuario:gestionar"));
  if (areas.length === 0) return <EmptyState title="Todavía no hay personas en el directorio" />;
  return <AreaExplorer areas={areas} />;
}
