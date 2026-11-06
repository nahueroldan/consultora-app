import { Badge } from "@/components/ui/card";
import { IDEA_STATUS_LABEL, type IdeaStatus } from "@/lib/data/ideas";

const TONE: Record<IdeaStatus, "neutral" | "accent" | "warning" | "success"> = {
  abierta: "accent",
  en_evaluacion: "warning",
  cerrada: "neutral",
  convertida: "success",
};

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  return <Badge tone={TONE[status]}>{IDEA_STATUS_LABEL[status]}</Badge>;
}
