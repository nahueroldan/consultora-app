import { Suspense } from "react";
import { connection } from "next/server";
import { WidgetCustomizer } from "@/components/home/widget-customizer";
import { IdeasByStatusWidget, IdeasMineWidget, IdeasTopWidget, ProjectsWidget, ProposalsWidget, QuickAccessWidget } from "@/components/home/widget-views";
import { CardSkeleton } from "@/components/ui/skeleton";
import { requireUser } from "@/lib/auth/session";
import { getUserWidgets } from "@/lib/data/preferences";
import type { WidgetConfig } from "@/lib/home/widgets";
import { saveWidgetsAction } from "@/app/(app)/widgets-actions";

function renderWidget(w: WidgetConfig, userEmail: string) {
  const props = { widget: w, userEmail };
  switch (w.id) {
    case "ideas-top": return <IdeasTopWidget {...props} />;
    case "ideas-mias": return <IdeasMineWidget {...props} />;
    case "ideas-por-estado": return <IdeasByStatusWidget />;
    case "propuestas-recientes": return <ProposalsWidget {...props} />;
    case "proyectos-activos": return <ProjectsWidget />;
    case "accesos": return <QuickAccessWidget />;
  }
}

async function Board() {
  await connection();
  const user = await requireUser();
  const all = await getUserWidgets(user.email);
  const widgets = all.filter((w) => w.enabled);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Inicio</h1>
          <p className="text-sm text-muted">Hola, {user.name ?? user.email.split("@")[0]}. Tu resumen de hoy.</p>
        </div>
        <WidgetCustomizer widgets={all} action={saveWidgetsAction} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map((w) => (
          <Suspense key={w.id} fallback={<CardSkeleton lines={4} />}>
            {renderWidget(w, user.email)}
          </Suspense>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<CardSkeleton lines={6} />}>
      <Board />
    </Suspense>
  );
}
