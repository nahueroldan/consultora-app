import Link from "next/link";

/** Superficie de card: radio grande, borde suave y sombra difusa. */
export const cardSurface =
  "rounded-3xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]";

const base = cardSurface;

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`${base} p-5 ${className}`}>{children}</div>;
}

/** Card completa clickeable, con foco visible para teclado. */
export function LinkCard({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${base} block p-5 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "accent";
}) {
  const tones = {
    neutral: "bg-cream text-muted",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    accent: "bg-accent-soft text-accent",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}
