import { Card } from "@/components/ui/card";
import { WIDGET_META, type WidgetId } from "@/lib/home/widgets";

/** Marco común de los widgets: título, tipo (interactivo o informativo) y contenido. */
export function WidgetCard({ id, title, action, children }: { id: WidgetId; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  const kind = WIDGET_META[id].kind;
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-tight">{title}</h2>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{kind}</p>
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
