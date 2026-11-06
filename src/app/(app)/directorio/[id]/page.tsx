import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getPerson } from "@/lib/data/people";
import { confirmProfile } from "@/app/(app)/directorio/actions";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const user = await requireUser();
  const { id } = await params;
  const personId = Number(id);
  if (!Number.isInteger(personId)) notFound();

  const person = await getPerson(personId);
  if (!person) notFound();

  // Un colaborador no ve perfiles pendientes de otras personas.
  const canSee = person.status === "confirmed" || user.role === "admin" || user.personId === personId;
  if (!canSee) notFound();

  const canConfirm = person.status === "pending" && (user.role === "admin" || user.personId === personId);

  return (
    <article className="space-y-6">
      <Link href="/directorio" className="text-sm text-zinc-500 hover:underline">← Volver al directorio</Link>
      <header>
        <h1 className="text-2xl font-semibold">{person.firstName} {person.lastName}</h1>
        <p className="text-zinc-600">{person.position ?? "Sin puesto"} · {person.area ?? "Sin área"}</p>
        <p className="text-sm text-zinc-500">
          {[person.city, person.country].filter(Boolean).join(", ") || "Sin ubicación"}
          {person.linkedin && (
            <> · <a href={person.linkedin} className="underline" target="_blank" rel="noreferrer">LinkedIn</a></>
          )}
        </p>
        <p className="mt-2 text-sm">
          Estado:{" "}
          <strong>{person.status === "confirmed" ? "Confirmado" : "Pendiente de confirmación"}</strong>
        </p>
      </header>

      {canConfirm && (
        <form
          action={async () => {
            "use server";
            await confirmProfile(personId);
          }}
        >
          <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-white">
            Confirmar mi perfil
          </button>
          <p className="mt-2 text-xs text-zinc-500">
            Al confirmar aceptás aparecer en squads y propuestas de la consultora.
          </p>
        </form>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Skills</h2>
        {person.skills.length === 0 ? (
          <p className="text-sm text-zinc-500">Sin skills cargadas.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {person.skills.map((s) => (
              <li key={s.name} className="rounded-full border px-3 py-1 text-sm">{s.name}</li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}
