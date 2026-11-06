"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, House, Lightbulb, FileText, Users, type LucideIcon } from "lucide-react";

type NavDef = { href: string; label: string; Icon: LucideIcon };

const MAIN: NavDef[] = [
  { href: "/", label: "Inicio", Icon: House },
  { href: "/propuestas", label: "Propuestas", Icon: FileText },
  { href: "/ideas", label: "Ideas", Icon: Lightbulb },
  { href: "/proyectos", label: "Proyectos", Icon: FolderKanban },
  { href: "/directorio", label: "Directorio", Icon: Users },
];

// En móvil la barra inferior muestra los cuatro accesos principales.
const MOBILE: NavDef[] = [MAIN[0], MAIN[1], MAIN[2], MAIN[4]];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar en escritorio. */
export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 p-4 md:flex">
      <p className="font-display mb-6 px-3 pt-2 text-xl text-accent">Consultora</p>
      {MAIN.map(({ href, label, Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition ${
              active ? "bg-accent text-white shadow-sm" : "text-muted hover:bg-surface hover:text-ink"
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
