"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SubmitButton, buttonBase } from "@/components/ui/button";
import { ServerForm } from "@/components/ui/server-form";
import { WIDGET_META, MAX_COUNT, MIN_COUNT, type WidgetConfig } from "@/lib/home/widgets";
import type { ActionResult } from "@/lib/form-result";

const SOURCE_LABEL = { todas: "Todas las ideas", mias: "Solo mis ideas", cerradas: "Solo cerradas" } as const;
const input = "rounded-xl border border-line bg-cream px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-accent";

/** Modal para elegir qué widgets ver, cuántos elementos y de qué fuente. */
export function WidgetCustomizer({
  widgets,
  action,
}: {
  widgets: WidgetConfig[];
  action: (fd: FormData) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${buttonBase} border border-line bg-surface text-ink`}>
        <Settings2 size={16} aria-hidden /> Personalizar inicio
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Personalizar inicio" description="Elegí qué ver en tu inicio. Se guarda para tu usuario." size="lg">
        <div className="h-full overflow-y-auto">
          <ServerForm action={action} onSuccess={() => setOpen(false)} className="space-y-3">
            {widgets.map((w) => {
              const meta = WIDGET_META[w.id];
              return (
                <fieldset key={w.id} className="grid items-center gap-3 rounded-2xl border border-line bg-surface p-4 md:grid-cols-[1fr_auto_auto]">
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <input type="checkbox" name={`${w.id}_enabled`} defaultChecked={w.enabled} className="size-4 accent-accent" />
                    <span>
                      {meta.label}
                      <span className="ml-2 font-mono text-[11px] uppercase text-muted">{meta.kind}</span>
                    </span>
                  </label>
                  {meta.hasCount ? (
                    <label className="flex items-center gap-2 text-xs text-muted">
                      Cantidad
                      <input name={`${w.id}_count`} type="number" min={MIN_COUNT} max={MAX_COUNT} defaultValue={w.count} className={`${input} w-20`} />
                    </label>
                  ) : (
                    <span />
                  )}
                  {meta.hasSource ? (
                    <select name={`${w.id}_source`} defaultValue={w.source} className={input} aria-label={`Fuente de ${meta.label}`}>
                      {(Object.keys(SOURCE_LABEL) as (keyof typeof SOURCE_LABEL)[]).map((s) => (
                        <option key={s} value={s}>{SOURCE_LABEL[s]}</option>
                      ))}
                    </select>
                  ) : (
                    <span />
                  )}
                </fieldset>
              );
            })}
            <SubmitButton pendingLabel="Guardando…" className="w-full">Guardar</SubmitButton>
          </ServerForm>
        </div>
      </Modal>
    </>
  );
}
