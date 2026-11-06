import Link from "next/link";
import { Badge } from "@/components/ui/card";

/**
 * Fila tipo ticket: avatar con inicial, título con número, línea de detalle
 * y, a la derecha, una acción (voto, estado o dato). Es el patrón de las listas.
 */
export function TicketRow({
  href,
  initial,
  title,
  id,
  meta,
  status,
  action,
}: {
  href: string;
  initial: string;
  title: string;
  id?: number;
  meta: string[];
  status?: { label: string; tone: "neutral" | "success" | "warning" | "accent" };
  action?: React.ReactNode;
}) {
  return (
    <div className="group flex items-center gap-4 px-5 py-4 transition hover:bg-cream/60">
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm text-accent">
        {initial.toUpperCase()}
      </span>
      <Link href={href} className="min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-accent">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-medium group-hover:text-accent">{title}</span>
          {id !== undefined && <span className="shrink-0 font-mono text-xs text-muted">#{id}</span>}
        </span>
        <span className="mt-0.5 block truncate text-sm text-muted">
          {meta.filter(Boolean).join(" · ")}
        </span>
      </Link>
      {status && (
        <span className="hidden sm:block">
          <Badge tone={status.tone}>{status.label}</Badge>
        </span>
      )}
      {action}
    </div>
  );
}

/** Contenedor de filas: una sola superficie con separadores suaves. */
export function TicketList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">{children}</div>;
}
