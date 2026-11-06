"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { buttonBase } from "@/components/ui/button";

/** Botón que abre un modal con contenido de formulario. */
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
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${buttonBase} bg-accent text-white hover:bg-accent-hover`}>
        {triggerLabel}
      </button>
      <Modal open={open} onClose={close} title={title} description={description}>
        <div className="h-full overflow-y-auto">{children(close)}</div>
      </Modal>
    </>
  );
}
