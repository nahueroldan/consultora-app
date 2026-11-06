import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { requireUser } from "@/lib/auth/session";
import { getProposal } from "@/lib/data/proposals";
import { computeProposalTotals } from "@/lib/proposals/total";

const money = (n: number) => `USD ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await requireUser();
  const { id } = await params;
  const proposalId = Number(id);
  if (!Number.isInteger(proposalId)) notFound();

  const proposal = await getProposal(proposalId);
  if (!proposal) notFound();

  const totals = computeProposalTotals(proposal.items, proposal.discountPct);

  return (
    <article className="space-y-6">
      <Link href="/propuestas" className="text-sm text-muted hover:text-accent">← Propuestas</Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight">{proposal.title}</h1>
          <p className="text-muted">{proposal.projectName} · {proposal.client ?? "Sin cliente"}</p>
        </div>
        <a
          href={`/api/propuestas/${proposal.id}/pdf`}
          className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-medium text-on-accent hover:bg-accent-hover"
        >
          Descargar PDF
        </a>
      </header>

      <div className="overflow-x-auto rounded-3xl border border-line bg-surface p-2 shadow-sm"><table className="w-full text-left text-sm">
        <thead className="border-b border-line font-mono text-xs text-muted">
          <tr><th className="py-2">Rol</th><th>Horas</th><th>Tarifa/h</th><th className="text-right">Subtotal</th></tr>
        </thead>
        <tbody>
          {proposal.items.map((i, idx) => (
            <tr key={idx} className="border-b border-line last:border-0">
              <td className="py-2">{i.role}</td>
              <td>{i.hours}</td>
              <td>{money(i.hourlyRate)}</td>
              <td className="text-right">{money(i.hours * i.hourlyRate)}</td>
            </tr>
          ))}
        </tbody>
      </table></div>

      <dl className="ml-auto grid w-full max-w-sm grid-cols-2 gap-x-8 gap-y-2 rounded-3xl border border-line bg-surface p-5 text-sm shadow-sm">
        <dt className="text-muted">Horas totales</dt><dd className="text-right">{totals.totalHours}</dd>
        <dt className="text-muted">Subtotal</dt><dd className="text-right">{money(totals.subtotal)}</dd>
        {proposal.discountPct > 0 && (
          <>
            <dt className="text-muted">Descuento ({proposal.discountPct}%)</dt>
            <dd className="text-right">- {money(totals.discount)}</dd>
          </>
        )}
        <dt className="font-semibold">Total</dt><dd className="text-right font-display text-lg text-accent">{money(totals.total)}</dd>
      </dl>

      {proposal.notes && (
        <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <h2 className="font-display text-lg">Notas</h2>
          <p className="whitespace-pre-line text-sm">{proposal.notes}</p>
        </section>
      )}
    </article>
  );
}

export default function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}
