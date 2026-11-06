import { ArrowLeft } from "lucide-react";
import { IconLink } from "@/components/ui/icon-link";
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
      <IconLink href="/directorio" label="Volver al directorio" Icon={ArrowLeft} />
      <header>
        <h1 className="font-display text-3xl tracking-tight">{person.firstName} {person.lastName}</h1>
        <p className="text-muted">{person.position ?? "Sin puesto"} · {person.area ?? "Sin área"}</p>
        <p className="text-sm text-muted">
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
          <button type="submit" className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-hover">
            Confirmar mi perfil
          </button>
          <p className="mt-2 text-xs text-muted">
            Al confirmar aceptás aparecer en squads y propuestas de la consultora.
          </p>
        </form>
      )}

      <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
        <h2 className="mb-3 font-display text-lg">Skills</h2>
        {person.skills.length === 0 ? (
          <p className="text-sm text-muted">Sin skills cargadas.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {person.skills.map((s) => (
              <li key={s.name} className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent">{s.name}</li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}
