import { connection } from "next/server";
import { auth } from "@/auth";
import { getProposal } from "@/lib/data/proposals";
import { buildProposalPdf } from "@/lib/proposals/pdf";
import { computeProposalTotals } from "@/lib/proposals/total";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await auth();
  if (!session?.user?.email) {
    return new Response("No autorizado", { status: 401 });
  }

  const { id } = await ctx.params;
  const proposalId = Number(id);
  if (!Number.isInteger(proposalId)) {
    return new Response("No encontrado", { status: 404 });
  }

  const proposal = await getProposal(proposalId);
  if (!proposal) return new Response("No encontrado", { status: 404 });

  const bytes = await buildProposalPdf({
    title: proposal.title,
    projectName: proposal.projectName,
    client: proposal.client,
    createdAt: proposal.createdAt,
    items: proposal.items,
    totals: computeProposalTotals(proposal.items, proposal.discountPct),
    discountPct: proposal.discountPct,
    notes: proposal.notes,
  });

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="propuesta-${proposal.id}.pdf"`,
    },
  });
}
