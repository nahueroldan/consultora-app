import Link from "next/link";
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
      {/* Barra superior: la marca lleva al inicio; a la derecha, configuración. */}
      <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="font-display text-xl text-ink">
              Consultora
            </Link>
          </div>
          <UserMenu email={email} role={role} isAdmin={isAdmin} signOutAction={signOutAction} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-6 md:px-8 md:pb-12">{children}</main>

      <MobileNav />
    </div>
  );
}
