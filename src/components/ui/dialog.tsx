"use client";

import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { buttonBase } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import type { ActionResult } from "@/lib/form-result";

/**
 * Botón que abre un modal con un formulario de servidor.
 * Recibe elementos (no funciones) porque los Server Components solo pueden
 * pasar datos serializables a Client Components.
 */
export function Dialog({
  triggerLabel,
  title,
  description,
  action,
  children,
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  action: (fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`}>
        {triggerLabel}
      </button>
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
