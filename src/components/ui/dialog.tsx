"use client";

import { useEffect, useRef, useState } from "react";
import { buttonBase } from "@/components/ui/button";

/**
 * Modal con <dialog> nativo: foco atrapado, Escape para cerrar y foco
 * devuelto al disparador. En móvil ocupa toda la pantalla.
 */
export function Dialog({
  triggerLabel,
  title,
  description,
  children,
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // El estado de React es la fuente de verdad; el <dialog> nativo lo sigue.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isOpen && !el.open) el.showModal();
    if (!isOpen && el.open) el.close();
  }, [isOpen]);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      <button type="button" onClick={open} className={`${buttonBase} bg-accent text-white hover:bg-accent-hover`}>
        {triggerLabel}
      </button>
      <dialog
        ref={ref}
        onClose={() => setIsOpen(false)}
        aria-labelledby="dialog-title"
        className="m-auto h-full max-h-none w-full max-w-none overflow-y-auto rounded-none bg-surface p-0 text-ink backdrop:bg-ink/40 md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 id="dialog-title" className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted">{description}</p>}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="rounded-lg px-2 py-1 text-muted hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children(close)}</div>
      </dialog>
    </>
  );
}
