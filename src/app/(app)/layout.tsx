import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { signOut } from "@/auth";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await requireUser();
  const isAdmin = can(user.role, "usuario:gestionar");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 p-4 text-sm">
          <span className="font-semibold">Consultora</span>
          <Link href="/directorio" className="hover:underline">Directorio</Link>
          {isAdmin && <Link href="/usuarios" className="hover:underline">Usuarios</Link>}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-zinc-500">
              {user.email} · {user.role ?? "sin rol"}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button type="submit" className="rounded-md border px-2 py-1">Salir</button>
            </form>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-400">Cargando…</p>}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
