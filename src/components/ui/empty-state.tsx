import Link from "next/link";
import { buttonBase } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center">
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className={`${buttonBase} mt-4 bg-accent text-white hover:bg-accent-hover`}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
