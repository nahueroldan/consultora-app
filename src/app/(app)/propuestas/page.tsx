import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { Badge, Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { SubmitButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/ui/skeleton";
import { can } from "@/lib/auth/roles";
import { requireUser } from "@/lib/auth/session";
import { listProjectOptions, listProposals } from "@/lib/data/proposals";
import { createProposalAction } from "@/app/(app)/propuestas/actions";

// Roles frecuentes de un equipo de consultoría. Se pueden editar o dejar vacíos.
const ROLE_PRESETS = ["Dev", "EM", "QA", "UX", "Head"];
const EXTRA_ROWS = 3;

const inputClass = "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent";

async function Content() {
  await connection();
  const user = await requireUser();
  const canCreate = can(user.role, "propuesta:crear");
  const [proposals, projects] = await Promise.all([listProposals(), listProjectOptions()]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Propuestas</h1>
          <p className="text-sm text-muted">Armá el equipo por roles y descargá el PDF para el cliente.</p>
        </div>
        {canCreate && (
          <Dialog triggerLabel="Nueva propuesta" title="Nueva propuesta" description="Completá las horas de cada rol. Las filas vacías se ignoran.">
            {() => (
              <form action={createProposalAction} className="space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <label className="space-y-1 text-sm font-medium md:col-span-1">
                    Proyecto
                    <select name="projectId" required className={inputClass}>
                      <option value="">Elegí un proyecto</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1 text-sm font-medium md:col-span-2">
                    Título
                    <input name="title" required placeholder="Ej.: Equipo para el módulo de pagos" className={inputClass} />
                  </label>
                </div>

                <fieldset className="space-y-2">
                  <legend className="mb-2 text-sm font-medium">Equipo</legend>
                  <div className="hidden grid-cols-[1fr_6rem_8rem] gap-2 text-xs font-medium uppercase tracking-wide text-muted md:grid">
                    <span>Rol</span><span>Horas</span><span>Tarifa USD/h</span>
                  </div>
                  {[...ROLE_PRESETS, ...Array.from({ length: EXTRA_ROWS }, () => "")].map((preset, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_6rem_8rem]">
                      <input
                        name={`role_${i}`}
                        defaultValue={preset}
                        aria-label={`Rol ${i + 1}`}
                        placeholder="Otro rol"
                        className={`${inputClass} col-span-2 md:col-span-1`}
                      />
                      <input name={`hours_${i}`} type="number" min={0} inputMode="numeric" placeholder="Horas" aria-label={`Horas del rol ${i + 1}`} className={inputClass} />
                      <input name={`rate_${i}`} type="number" min={0} step="0.01" inputMode="decimal" placeholder="USD/h" aria-label={`Tarifa del rol ${i + 1}`} className={inputClass} />
                    </div>
                  ))}
                </fieldset>

                <div className="grid gap-3 md:grid-cols-4">
                  <label className="space-y-1 text-sm font-medium">
                    Descuento %
                    <input name="discountPct" type="number" min={0} max={100} defaultValue={0} className={inputClass} />
                  </label>
                  <label className="space-y-1 text-sm font-medium md:col-span-3">
                    Notas para el cliente
                    <textarea name="notes" rows={3} className={inputClass} />
                  </label>
                </div>

                <SubmitButton pendingLabel="Creando propuesta…" className="w-full md:w-auto">
                  Crear propuesta
                </SubmitButton>
              </form>
            )}
          </Dialog>
        )}
      </div>

      {proposals.length === 0 ? (
        <EmptyState title="Todavía no hay propuestas" description="Creá la primera desde el botón de arriba." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proposals.map((p) => (
            <li key={p.id}>
              <Link href={`/propuestas/${p.id}`} className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-accent">
                <Card className="flex h-full flex-col gap-3 transition hover:border-accent hover:shadow">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{p.title}</h2>
                    {p.discountPct > 0 && <Badge tone="warning">-{p.discountPct}%</Badge>}
                  </div>
                  <p className="text-sm text-muted">{p.projectName}</p>
                  <p className="mt-auto text-xs text-muted">{p.createdAt.toLocaleDateString("es-AR")}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function PropuestasPage() {
  return (
    <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>}>
      <Content />
    </Suspense>
  );
}
