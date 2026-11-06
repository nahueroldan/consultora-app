import { signOut } from "@/auth";
import { MobileNav, SidebarNav, type NavItem } from "@/components/nav";
import { SubmitButton } from "@/components/ui/button";

const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/propuestas", label: "Propuestas" },
  { href: "/ideas", label: "Ideas" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/directorio", label: "Directorio" },
];

const ADMIN_NAV: NavItem[] = [{ href: "/usuarios", label: "Usuarios" }];

// En móvil la barra inferior muestra los cuatro accesos que más se usan.
const MOBILE_NAV: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/propuestas", label: "Propuestas" },
  { href: "/ideas", label: "Ideas" },
  { href: "/directorio", label: "Directorio" },
];

export function AppShell({
  children,
  email,
  role,
  isAdmin,
}: {
  children: React.ReactNode;
  email: string;
  role: string | null;
  isAdmin: boolean;
}) {
  const sidebarItems = isAdmin ? [...MAIN_NAV, ...ADMIN_NAV] : MAIN_NAV;
  return (
    <div className="flex min-h-screen">
      <SidebarNav items={sidebarItems} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-4 py-3 md:px-8">
          <p className="text-lg font-semibold text-accent md:hidden">Consultora</p>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <div className="hidden text-right md:block">
              <p className="font-medium">{email}</p>
              <p className="text-xs text-muted">{role ?? "sin rol"}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <SubmitButton variant="secondary" pendingLabel="Saliendo…" className="min-h-9 px-3">
                Salir
              </SubmitButton>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">
          {children}
        </main>
      </div>

      <MobileNav items={MOBILE_NAV} />
    </div>
  );
}
