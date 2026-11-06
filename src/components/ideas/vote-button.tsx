import { SubmitButton } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import type { ActionResult } from "@/lib/form-result";

/** Botón de voto. El voto se quita y pone con un clic. */
export function VoteButton({
  ideaId,
  votes,
  voted,
  action,
  size = "md",
}: {
  ideaId: number;
  votes: number;
  voted: boolean;
  action: (fd: FormData) => Promise<ActionResult>;
  size?: "sm" | "md";
}) {
  return (
    <ServerForm action={action}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <SubmitButton
        variant={voted ? "primary" : "secondary"}
        pendingLabel="…"
        className={size === "sm" ? "min-h-8 px-3 text-xs" : ""}
      >
        <span aria-hidden>▲</span>
        <span>{votes}</span>
        <span className="sr-only">{voted ? "Quitar mi voto" : "Votar esta idea"}</span>
      </SubmitButton>
    </ServerForm>
  );
}
