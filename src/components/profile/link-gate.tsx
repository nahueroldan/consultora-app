"use client";

import { useState } from "react";
import { DISMISS_COOKIE } from "@/lib/profile/gate-cookie";
import { Modal } from "@/components/ui/modal";
import { SubmitButton, buttonBase } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import type { ActionResult } from "@/lib/form-result";


type Candidate = { id: number; firstName: string; lastName: string; position: string | null };

/** "¿Sos vos?": se muestra si la cuenta todavía no tiene un perfil del directorio. */
export function LinkGate({
  candidates,
  claimAction,
  requestAction,
}: {
  candidates: Candidate[];
  claimAction: (fd: FormData) => Promise<ActionResult>;
  requestAction: () => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(true);
  const [requested, setRequested] = useState(false);

  // Cerrarla deja una cookie: el servidor no la vuelve a mostrar en este dispositivo.
  const dismiss = () => {
    document.cookie = `${DISMISS_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={dismiss}
      title="¿Sos vos?"
      description="Elegí tu perfil del directorio. Así vas a poder confirmarlo y editar tus datos."
    >
      <div className="flex h-full flex-col gap-4 overflow-y-auto">
        {candidates.length > 0 ? (
          <ul className="space-y-2">
            {candidates.map((c) => (
              <li key={c.id}>
                <ServerForm action={claimAction} onSuccess={dismiss} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3">
                  <input type="hidden" name="personId" value={c.id} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.firstName} {c.lastName}</p>
                    <p className="truncate text-xs text-muted">{c.position ?? "Sin puesto cargado"}</p>
                  </div>
                  <SubmitButton pendingLabel="Vinculando…" className="min-h-9 shrink-0">Soy yo</SubmitButton>
                </ServerForm>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-cream p-4 text-sm text-muted">No encontramos perfiles con tu nombre.</p>
        )}

        <div className="border-t border-line pt-4">
          {requested ? (
            <p className="text-sm text-muted">Listo. Un admin va a revisar tu cuenta.</p>
          ) : (
            <ServerForm action={requestAction} onSuccess={() => setRequested(true)} className="flex flex-col gap-2">
              <p className="text-sm text-muted">¿No aparecés? Pedí que un admin te vincule.</p>
              <button type="submit" className={`${buttonBase} border border-line bg-surface text-ink`}>
                No aparezco en la lista
              </button>
            </ServerForm>
          )}
        </div>
      </div>
    </Modal>
  );
}
