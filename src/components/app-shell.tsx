import Link from "next/link";
import { House } from "lucide-react";
import { MobileNav } from "@/components/nav";
import { UserMenu } from "@/components/user-menu";
import { signOut } from "@/auth";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

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
  return (
    <div className="flex min-h-screen flex-col">
      {/* Barra superior mínima: marca, volver al inicio y configuración. */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-line/60 bg-cream/80 px-4 py-3 backdrop-blur md:px-8">
        <Link href="/" className="brand-text font-display text-xl">
          Consultora
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface hover:text-ink"
          >
            <House size={16} aria-hidden /> Inicio
          </Link>
          <UserMenu email={email} role={role} isAdmin={isAdmin} signOutAction={signOutAction} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-6 md:px-8 md:pb-12">{children}</main>

      <MobileNav />
    </div>
  );
}
