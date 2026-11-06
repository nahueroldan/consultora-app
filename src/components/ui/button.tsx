"use client";

import { useContext } from "react";
import { useFormStatus } from "react-dom";
import { PendingContext } from "@/components/ui/server-form";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent shadow-sm shadow-accent/20 hover:bg-accent-hover hover:shadow-md",
  secondary: "border border-line bg-surface text-ink hover:bg-accent-soft",
  ghost: "text-muted hover:bg-accent-soft hover:text-ink",
  danger: "bg-danger-soft text-danger hover:bg-danger hover:text-white",
};

/** Base de todos los botones: altura cómoda, radio grande y respuesta al tocar (escala suave). */
export const buttonBase =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

/**
 * Botón de envío de formularios. Muestra su propio estado de carga mientras
 * el servidor responde; no hay "Cargando" global.
 */
export function SubmitButton({
  children,
  pendingLabel = "Guardando…",
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: Variant;
  className?: string;
}) {
  const formStatus = useFormStatus().pending;
  const shared = useContext(PendingContext);
  const pending = shared ?? formStatus;
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${buttonBase} ${variants[variant]} ${className}`}
    >
      {pending && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}
