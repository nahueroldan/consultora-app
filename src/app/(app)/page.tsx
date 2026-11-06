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

async function Greeting() {
  await connection();
  const user = await requireUser();
  return (
    <div>
      <h1 className="font-display text-3xl tracking-tight">Hola, {(user.name ?? user.email.split("@")[0]).split(" ")[0]}</h1>
      <p className="text-sm text-muted">Tu resumen de hoy.</p>
    </div>
  );
}

async function Board() {
  await connection();
  const user = await requireUser();
  const all = await getUserWidgets(user.email);
  const widgets = all.filter((w) => w.enabled);
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <WidgetCustomizer widgets={all} action={saveWidgetsAction} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map((w) => (
          <Suspense key={w.id} fallback={<CardSkeleton lines={4} />}>
            {renderWidget(w, user.email)}
          </Suspense>
        ))}
      </div>
    </>
  );
}

/** El saludo y el contenedor del tour existen desde el primer render; los widgets llegan en streaming. */
export default function HomePage() {
  return (
    <div className="space-y-5">
      <div data-tour="inicio" className="min-h-16">
        <Suspense fallback={<div className="h-9 w-64 animate-pulse rounded-xl bg-line/60" />}>
          <Greeting />
        </Suspense>
      </div>
      <Suspense fallback={<CardSkeleton lines={6} />}>
        <Board />
      </Suspense>
    </div>
  );
}
