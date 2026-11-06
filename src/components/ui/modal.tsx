"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal controlado sobre <dialog> nativo: foco atrapado, Escape para cerrar.
 * A pantalla completa en móvil, centrado en escritorio.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const width = size === "lg" ? "md:max-w-3xl" : "md:max-w-xl";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className={`m-0 mt-auto h-[88vh] w-full max-w-none overflow-hidden rounded-t-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/40 md:inset-auto md:left-1/2 md:top-1/2 md:m-0 md:h-auto md:max-h-[88vh] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl ${width}`}
    >
      {open && (
        <div className="flex h-full flex-col">
          {/* Tirador visible solo en móvil: indica que es una hoja. */}
          <div aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-line md:hidden" />
          <div className="flex items-start justify-between gap-4 border-b border-line p-5">
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-xl">{title}</h2>
              {description && <p className="text-sm text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="shrink-0 rounded-2xl p-2 text-muted hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden p-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}
