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
      <Link href="/propuestas" className="text-sm text-zinc-500 hover:underline">← Propuestas</Link>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{proposal.title}</h1>
          <p className="text-zinc-600">{proposal.projectName} · {proposal.client ?? "Sin cliente"}</p>
        </div>
        <a
          href={`/api/propuestas/${proposal.id}/pdf`}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white"
        >
          Descargar PDF
        </a>
      </header>

      <table className="w-full text-left text-sm">
        <thead className="border-b text-zinc-500">
          <tr><th className="py-2">Rol</th><th>Horas</th><th>Tarifa/h</th><th className="text-right">Subtotal</th></tr>
        </thead>
        <tbody>
          {proposal.items.map((i, idx) => (
            <tr key={idx} className="border-b">
              <td className="py-2">{i.role}</td>
              <td>{i.hours}</td>
              <td>{money(i.hourlyRate)}</td>
              <td className="text-right">{money(i.hours * i.hourlyRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="ml-auto grid w-fit grid-cols-2 gap-x-8 gap-y-1 text-sm">
        <dt className="text-zinc-500">Horas totales</dt><dd className="text-right">{totals.totalHours}</dd>
        <dt className="text-zinc-500">Subtotal</dt><dd className="text-right">{money(totals.subtotal)}</dd>
        {proposal.discountPct > 0 && (
          <>
            <dt className="text-zinc-500">Descuento ({proposal.discountPct}%)</dt>
            <dd className="text-right">- {money(totals.discount)}</dd>
          </>
        )}
        <dt className="font-semibold">Total</dt><dd className="text-right font-semibold">{money(totals.total)}</dd>
      </dl>

      {proposal.notes && (
        <section>
          <h2 className="font-semibold">Notas</h2>
          <p className="whitespace-pre-line text-sm">{proposal.notes}</p>
        </section>
      )}
    </article>
  );
}

export default function PropuestaPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-400">Cargando…</p>}>
      <Content params={params} />
    </Suspense>
  );
}
