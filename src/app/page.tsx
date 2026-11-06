import { Suspense } from "react";
import { connection } from "next/server";
import { auth, signOut } from "@/auth";

async function SessionInfo() {
  await connection();
  const session = await auth();
  return (
    <>
      <p className="text-sm text-zinc-600">
        Sesión iniciada como <strong>{session?.user?.email}</strong> · rol{" "}
        <strong>{session?.user?.role ?? "sin rol"}</strong>
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit" className="rounded-md border px-3 py-1 text-sm">
          Salir
        </button>
      </form>
    </>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Consultora</h1>
      <Suspense fallback={<p className="text-sm text-zinc-400">Cargando sesión…</p>}>
        <SessionInfo />
      </Suspense>
    </main>
  );
}
