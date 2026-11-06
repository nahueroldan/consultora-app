import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { getTourClosed } from "@/lib/data/users";
import { findCandidates, getUserLinkState } from "@/lib/data/profile";
import { getOwnProfile } from "@/lib/data/own-profile";
import { cookies } from "next/headers";
import { DISMISS_COOKIE } from "@/lib/profile/gate-cookie";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireUser();
  const tourClosed = await getTourClosed(user.email);
  const link = await getUserLinkState(user.email);
  const dismissed = (await cookies()).get(DISMISS_COOKIE)?.value === "1";
  const needsLink = !link?.personId && !link?.linkRequested && !dismissed;
  const linkCandidates = needsLink ? await findCandidates(link?.name ?? user.name ?? user.email) : null;
  const ownProfile = link?.personId ? await getOwnProfile(link.personId) : null;
  return (
    <AppShell
      email={user.email}
      role={user.role}
      isAdmin={can(user.role, "usuario:gestionar")}
      tourClosed={tourClosed}
      linkCandidates={linkCandidates}
      ownProfile={ownProfile}
    >
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
