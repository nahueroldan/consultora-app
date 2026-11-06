"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, FolderKanban, House, Lightbulb, Users, type LucideIcon } from "lucide-react";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";

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

/** Barra inferior en móvil. El resalte se desliza entre secciones. */
export function MobileNav() {
  const pathname = usePathname();
  const active = MOBILE.find((m) => isActive(pathname, m.href))?.href ?? "";
  return (
    <nav
      aria-label="Principal"
      className="glass fixed inset-x-3 bottom-3 z-30 grid rounded-3xl border border-line p-1.5 shadow-lg md:hidden"
      style={{ gridTemplateColumns: `repeat(${MOBILE.length}, minmax(0, 1fr))` }}
    >
      {/* key por ruta: el resalte arranca en la sección actual en cada navegación */}
      <AnimatedBackground
        key={pathname}
        defaultValue={active}
        className="rounded-2xl bg-accent-soft"
        transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
      >
        {MOBILE.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            data-id={href}
            aria-current={active === href ? "page" : undefined}
            className={`relative flex min-h-12 items-center justify-center rounded-2xl text-[11px] font-medium transition ${
              active === href ? "text-accent" : "text-muted"
            }`}
          >
            <span className="flex flex-col items-center gap-0.5">
              <Icon size={18} aria-hidden />
              {label}
            </span>
          </Link>
        ))}
      </AnimatedBackground>
    </nav>
  );
}
