import Link from "next/link";
import { MobileNav } from "@/components/nav";
import { LinkGate } from "@/components/profile/link-gate";
import { claimProfileAction, requestLinkAction, updateOwnProfileAction } from "@/app/(app)/perfil/actions";
import { TourProvider } from "@/components/onboarding/tour";
import { tourStepsFor } from "@/lib/onboarding/steps";
import { closeTourAction } from "@/app/(app)/onboarding-actions";
import type { Role } from "@/lib/auth/roles";
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
  tourAutoOpen,
  linkCandidates,
  ownProfile,
}: {
  children: React.ReactNode;
  email: string;
  role: string | null;
  isAdmin: boolean;
  /** El recorrido se abre solo después de la ventana "¿Sos vos?", si la cuenta no lo cerró antes. */
  tourAutoOpen: boolean;
  /** Si viene, la cuenta todavía no tiene perfil vinculado: se muestra "¿Sos vos?". */
  linkCandidates: { id: number; firstName: string; lastName: string; position: string | null }[] | null;
  ownProfile: { position: string | null; city: string | null; country: string | null; linkedin: string | null; visibility: unknown } | null;
}) {
  const steps = tourStepsFor(role as Role | null);
  return (
    <TourProvider steps={steps} autoOpen={tourAutoOpen} closeAction={closeTourAction}>
    <div className="flex min-h-screen flex-col">
      {/* Barra superior: la marca lleva al inicio; a la derecha, configuración. */}
      <header className="sticky top-0 z-20 border-b border-line bg-cream/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-6">
            <Link href="/" className="font-display text-xl text-ink">
              Consultora
            </Link>
          </div>
          <UserMenu email={email} role={role} isAdmin={isAdmin} signOutAction={signOutAction} ownProfile={ownProfile} updateProfileAction={updateOwnProfileAction} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-6 md:px-8 md:pb-12">{children}</main>

      <MobileNav />
    </div>
    {linkCandidates && (
      <LinkGate candidates={linkCandidates} claimAction={claimProfileAction} requestAction={requestLinkAction} />
    )}
    </TourProvider>
  );
}
