"use client";

import { useState } from "react";
import { Bug } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SubmitButton } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import type { ActionResult } from "@/lib/form-result";
import { fieldClass as input } from "@/components/ui/field";


/** Botón del menú que abre el formulario para reportar un problema. */
export function ReportIssueMenuItem({ action }: { action: (fd: FormData) => Promise<ActionResult> }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <>
      <button
        role="menuitem"
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm hover:bg-cream"
      >
        <Bug size={16} aria-hidden /> Reportar un problema
      </button>
      <Modal open={open} onClose={() => { setOpen(false); setSent(false); }} title="Reportar un problema" description="Contá qué pasó. Lo recibe el equipo y queda registrado para arreglarlo.">
        <div className="h-full overflow-y-auto">
          {sent ? (
            <p className="rounded-2xl bg-success-soft p-4 text-sm text-success">¡Gracias! Recibimos tu reporte.</p>
          ) : (
            <ServerForm
              action={async (fd) => {
                fd.set("page", window.location.pathname);
                return action(fd);
              }}
              onSuccess={() => setSent(true)}
              className="space-y-4"
            >
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Qué pasó (título corto)
                <input name="title" required maxLength={120} placeholder="Ej.: no puedo votar una idea" className={input} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Detalle: qué hacías y qué esperabas
                <textarea name="description" required rows={5} maxLength={4000} className={input} />
              </label>
              <SubmitButton pendingLabel="Enviando…" className="w-full">Enviar reporte</SubmitButton>
            </ServerForm>
          )}
        </div>
      </Modal>
    </>
  );
}
