"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderKanban, House, Lightbulb, Users, type LucideIcon } from "lucide-react";

type NavDef = { href: string; label: string; Icon: LucideIcon };

export const MAIN: NavDef[] = [
  { href: "/", label: "Inicio", Icon: House },
  { href: "/propuestas", label: "Propuestas", Icon: FileText },
  { href: "/ideas", label: "Ideas", Icon: Lightbulb },
  { href: "/proyectos", label: "Proyectos", Icon: FolderKanban },
  { href: "/directorio", label: "Directorio", Icon: Users },
];

// En móvil la barra inferior muestra los cuatro accesos principales.
export const MOBILE: NavDef[] = [MAIN[0], MAIN[1], MAIN[2], MAIN[4]];

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Barra inferior en móvil. */
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-3 bottom-3 z-30 grid rounded-3xl border border-line bg-surface/95 p-1.5 shadow-lg backdrop-blur md:hidden"
      style={{ gridTemplateColumns: `repeat(${MOBILE.length}, minmax(0, 1fr))` }}
    >
      {MOBILE.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] font-medium transition ${
              active ? "bg-accent-soft text-accent" : "text-muted"
            }`}
          >
            <Icon size={18} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
