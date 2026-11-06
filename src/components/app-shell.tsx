import { MobileNav, SidebarNav } from "@/components/nav";
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
    <div className="flex min-h-screen">
      <SidebarNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 bg-cream/80 px-4 py-3 backdrop-blur md:px-8">
          <p className="font-display text-lg text-accent md:hidden">Consultora</p>
          <div className="ml-auto">
            <UserMenu email={email} role={role} isAdmin={isAdmin} signOutAction={signOutAction} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-4 md:px-8 md:pb-12">{children}</main>
      </div>

      <MobileNav />
    </div>
  );
}
