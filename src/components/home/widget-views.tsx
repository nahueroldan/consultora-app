import Link from "next/link";
import { ArrowUpRight, FileText, FolderKanban, Lightbulb, Plus, Users } from "lucide-react";
import { IconLink } from "@/components/ui/icon-link";
import { Tooltip } from "@/components/ui/tooltip";
import { VoteButton } from "@/components/ideas/vote-button";
import { IdeaStatusBadge } from "@/components/ideas/status-badge";
import { WidgetCard } from "@/components/home/widget-card";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { EmptyState } from "@/components/ui/empty-state";
import { voteIdeaAction } from "@/app/(app)/ideas/actions";
import { IDEA_STATUSES, IDEA_STATUS_LABEL, countIdeasByStatus, listIdeas, listTopIdeas } from "@/lib/data/ideas";
import { listProjects } from "@/lib/data/projects";
import { listProposals } from "@/lib/data/proposals";
import type { WidgetConfig } from "@/lib/home/widgets";

type Props = { widget: WidgetConfig; userEmail: string };


export async function IdeasTopWidget({ widget, userEmail }: Props) {
  const ideas = await listTopIdeas({ userEmail, source: widget.source, limit: widget.count });
  return (
    <WidgetCard id="ideas-top" title="Ideas más votadas" action={<IconLink href="/ideas" label="Ver todas las ideas" Icon={ArrowUpRight} />}>
      {ideas.length === 0 ? (
        <EmptyState title="Sin ideas para mostrar" />
      ) : (
        <ul className="divide-y divide-line">
          {ideas.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
              <Link href={`/ideas/${i.id}`} className="min-w-0 truncate text-sm font-medium hover:text-accent">{i.title}</Link>
              <VoteButton ideaId={i.id} votes={i.votes} voted={i.votedByMe} action={voteIdeaAction} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export async function IdeasMineWidget({ widget, userEmail }: Props) {
  const ideas = (await listIdeas({ userEmail, onlyMine: true, limit: widget.count }));
  return (
    <WidgetCard id="ideas-mias" title="Mis ideas" action={<IconLink href="/ideas" label="Ver todas las ideas" Icon={ArrowUpRight} />}>
      {ideas.length === 0 ? (
        <EmptyState title="Todavía no cargaste ideas" actionHref="/ideas" actionLabel="Ir a ideas" />
      ) : (
        <ul className="divide-y divide-line">
          {ideas.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <Link href={`/ideas/${i.id}`} className="block truncate text-sm font-medium hover:text-accent">{i.title}</Link>
                <IdeaStatusBadge status={i.status} />
              </div>
              <VoteButton ideaId={i.id} votes={i.votes} voted={i.votedByMe} action={voteIdeaAction} size="sm" />
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export async function IdeasByStatusWidget() {
  const counts = await countIdeasByStatus();
  return (
    <WidgetCard id="ideas-por-estado" title="Ideas por estado">
      <ul className="grid grid-cols-2 gap-3">
        {IDEA_STATUSES.map((s) => (
          <li key={s}>
            <Link href={`/ideas?estado=${s}`} className="block rounded-2xl bg-cream p-3 hover:bg-accent-soft">
              <AnimatedNumber value={counts[s]} className="block font-mono text-2xl" />
              <p className="text-xs text-muted">{IDEA_STATUS_LABEL[s]}</p>
            </Link>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

export async function ProposalsWidget({ widget }: Props) {
  const proposals = (await listProposals()).slice(0, widget.count);
  return (
    <WidgetCard id="propuestas-recientes" title="Propuestas recientes" action={<IconLink href="/propuestas" label="Ver todas las propuestas" Icon={ArrowUpRight} />}>
      {proposals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-muted">Todavía no hay propuestas.</p>
          <IconLink href="/propuestas" label="Crear propuesta" Icon={Plus} />
        </div>
      ) : (
        <ul className="divide-y divide-line">
          {proposals.map((p) => (
            <li key={p.id}>
              <Link href={`/propuestas/${p.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:text-accent">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.title}</span>
                  <span className="block truncate text-xs text-muted">{p.projectName}</span>
                </span>
                <FileText size={16} aria-hidden className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export async function ProjectsWidget() {
  const projects = await listProjects();
  const activos = projects.filter((p) => p.status === "activo").length;
  return (
    <WidgetCard id="proyectos-activos" title="Proyectos activos">
      <Link href="/proyectos" className="flex items-center justify-between rounded-2xl bg-cream p-4 hover:bg-accent-soft">
        <AnimatedNumber value={activos} className="font-mono text-3xl" />
        <FolderKanban size={22} aria-hidden className="text-accent" />
      </Link>
    </WidgetCard>
  );
}

export function QuickAccessWidget() {
  const items = [
    { href: "/directorio", label: "Directorio", Icon: Users },
    { href: "/proyectos", label: "Proyectos", Icon: FolderKanban },
    { href: "/ideas", label: "Ideas", Icon: Lightbulb },
    { href: "/propuestas", label: "Propuestas", Icon: FileText },
  ];
  return (
    <WidgetCard id="accesos" title="Accesos rápidos">
      <ul className="grid grid-cols-4 gap-3">
        {items.map(({ href, label, Icon }) => (
          <li key={href} className="flex justify-center">
            <Tooltip label={label}>
              <Link
                href={href}
                aria-label={label}
                className="flex size-16 items-center justify-center rounded-3xl bg-accent-soft text-accent transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent"
              >
                <Icon size={28} aria-hidden />
              </Link>
            </Tooltip>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
