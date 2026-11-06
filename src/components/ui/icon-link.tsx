import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

/**
 * Enlace solo con icono. Tiene nombre accesible (aria-label) y un tooltip nativo,
 * para que se entienda sin depender del texto visible.
 */
export function IconLink({
  href,
  label,
  Icon,
  className = "",
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  className?: string;
}) {
  return (
    <Tooltip label={label}>
      <Link
        href={href}
        aria-label={label}
        className={`inline-flex size-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-ink transition hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent ${className}`}
      >
        <Icon size={18} aria-hidden />
      </Link>
    </Tooltip>
  );
}
