import { Suspense } from "react";
import { connection } from "next/server";
import { AppShell } from "@/components/app-shell";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { getTourClosed } from "@/lib/data/users";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireUser();
  const tourClosed = await getTourClosed(user.email);
  return (
    <AppShell
      email={user.email}
      role={user.role}
      isAdmin={can(user.role, "usuario:gestionar")}
      tourClosed={tourClosed}
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
