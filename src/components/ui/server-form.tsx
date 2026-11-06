"use client";

import { createContext, useState, useTransition, type FormEvent, type ReactNode } from "react";
import type { ActionResult } from "@/lib/form-result";

/** Estado de envío compartido con los botones del formulario. */
export const PendingContext = createContext<boolean | null>(null);

/**
 * Envía un formulario con una acción del servidor y muestra el error si falla.
 * No resetea los campos: si algo sale mal, el texto escrito se conserva.
 */
export function useServerForm(
  action: (fd: FormData) => Promise<ActionResult | void>,
  onSuccess?: () => void,
) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(fd);
        if (result && !result.ok) {
          setError(result.error);
          return;
        }
        onSuccess?.();
      } catch {
        setError("No se pudo guardar. Revisá la conexión y probá de nuevo.");
      }
    });
  };

  return { onSubmit, pending, error, clearError: () => setError(null) };
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
      {message}
    </p>
  );
}

/** Formulario genérico: muestra el error y bloquea el envío mientras guarda. */
export function ServerForm({
  action,
  onSuccess,
  className = "",
  children,
}: {
  action: (fd: FormData) => Promise<ActionResult | void>;
  onSuccess?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const { onSubmit, pending, error } = useServerForm(action, onSuccess);
  return (
    <form onSubmit={onSubmit} className={className} aria-busy={pending}>
      <fieldset disabled={pending} className="contents">
        <PendingContext.Provider value={pending}>
          {children}
        </PendingContext.Provider>
      </fieldset>
      <FormError message={error} />
    </form>
  );
}
