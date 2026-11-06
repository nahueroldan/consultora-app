"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { buttonBase } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import { Tooltip } from "@/components/ui/tooltip";
import type { LucideIcon } from "lucide-react";
import type { ActionResult } from "@/lib/form-result";

/**
 * Botón que abre un modal con un formulario de servidor.
 * Recibe elementos (no funciones) porque los Server Components solo pueden
 * pasar datos serializables a Client Components.
 */
export function Dialog({
  triggerLabel,
  triggerIcon: TriggerIcon,
  title,
  description,
  action,
  children,
}: {
  triggerLabel: string;
  /** Si viene, el disparador es solo un ícono con tooltip. */
  triggerIcon?: LucideIcon;
  title: string;
  description?: string;
  action: (fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {TriggerIcon ? (
        <Tooltip label={triggerLabel}>
          <button
            type="button"
            aria-label={triggerLabel}
            onClick={() => setOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-2xl border border-line bg-surface text-ink transition hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
          >
            <TriggerIcon size={18} aria-hidden />
          </button>
        </Tooltip>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={`${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`}>
          {triggerLabel}
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={title} description={description}>
        <div className="h-full overflow-y-auto">
          <ServerForm action={action} onSuccess={() => setOpen(false)} className="space-y-4">
            {children}
          </ServerForm>
        </div>
      </Modal>
    </>
  );
}
