"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SubmitButton, buttonBase } from "@/components/ui/button";
import { FormError, PendingContext, useServerForm } from "@/components/ui/server-form";
import type { ActionResult } from "@/lib/form-result";
import { computeProposalTotals, type ProposalItem } from "@/lib/proposals/total";

const STEPS = ["Proyecto", "Equipo", "Condiciones", "Revisión"] as const;
const ROLE_PRESETS = ["Dev", "EM", "QA", "UX", "Head"];
const EXTRA_ROWS = 3;

const input =
  "w-full rounded-2xl border border-line bg-cream px-4 py-2.5 text-sm font-normal focus-visible:outline-2 focus-visible:outline-accent";

type Project = { id: number; name: string };

export function ProposalWizard({
  projects,
  action,
  initialIdea,
}: {
  projects: Project[];
  action: (fd: FormData) => Promise<ActionResult>;
  /** Idea de origen: abre el wizard con el título cargado y la vincula. */
  initialIdea?: { id: number; title: string } | null;
}) {
  const [open, setOpen] = useState(Boolean(initialIdea));
  const [step, setStep] = useState(0);
  const [summary, setSummary] = useState<ProposalItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const { onSubmit, pending, error } = useServerForm(action);
  const reduce = useReducedMotion();

  const close = () => {
    setOpen(false);
    setStep(0);
  };

  // Valida solo los campos del paso actual; los demás siguen montados para enviarse.
  const stepValid = (index: number) => {
    const panel = formRef.current?.querySelector<HTMLElement>(`[data-step="${index}"]`);
    if (!panel) return true;
    const fields = panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input,select,textarea");
    for (const f of fields) {
      if (!f.checkValidity()) {
        f.reportValidity();
        return false;
      }
    }
    return true;
  };

  const readItems = (): ProposalItem[] => {
    const fd = new FormData(formRef.current ?? undefined);
    const items: ProposalItem[] = [];
    for (let i = 0; i < ROLE_PRESETS.length + EXTRA_ROWS; i++) {
      const role = String(fd.get(`role_${i}`) ?? "").trim();
      const hours = Number(fd.get(`hours_${i}`) ?? 0);
      const hourlyRate = Number(fd.get(`rate_${i}`) ?? 0);
      if (role && hours > 0) items.push({ role, hours, hourlyRate });
    }
    return items;
  };

  const next = () => {
    if (!stepValid(step)) return;
    const following = Math.min(step + 1, STEPS.length - 1);
    if (following === STEPS.length - 1) {
      const items = readItems();
      setSummary(items);
      setDiscount(Number(new FormData(formRef.current ?? undefined).get("discountPct") || 0));
    }
    setStep(following);
  };

  const totals = computeProposalTotals(summary, discount);
  const money = (n: number) => `USD ${n.toLocaleString("es-AR", { maximumFractionDigits: 2 })}`;

  const hiddenClass = (i: number) => (step === i ? "" : "hidden");

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`}>
        Nueva propuesta
      </button>

      <Modal
        open={open}
        onClose={close}
        title="Nueva propuesta"
        description={`Paso ${step + 1} de ${STEPS.length}: ${STEPS[step]}`}
        size="lg"
      >
        <div className="flex h-full flex-col gap-5 overflow-y-auto">
          <ol className="flex items-center gap-2" aria-label="Pasos">
            {STEPS.map((label, i) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                    i <= step ? "bg-accent text-on-accent" : "bg-cream text-muted"
                  }`}
                  aria-current={i === step ? "step" : undefined}
                >
                  {i < step ? <Check size={14} aria-hidden /> : i + 1}
                </span>
                <span className={`hidden truncate text-xs sm:block ${i === step ? "font-semibold" : "text-muted"}`}>{label}</span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden />}
              </li>
            ))}
          </ol>

          <form ref={formRef} onSubmit={onSubmit} className="flex flex-1 flex-col" aria-busy={pending}>
            <PendingContext.Provider value={pending}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div data-step="0" className={`${hiddenClass(0)} space-y-4`}>
                  <label className="block space-y-1 text-sm font-medium">
                    Proyecto
                    <select name="projectId" required className={input}>
                      <option value="">Elegí un proyecto</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </label>
                  <label className="block space-y-1 text-sm font-medium">
                    Título de la propuesta
                    <input
                      name="title"
                      required
                      defaultValue={initialIdea?.title ?? ""}
                      placeholder="Ej.: Equipo para el módulo de pagos"
                      className={input}
                    />
                  {initialIdea && <input type="hidden" name="ideaId" value={initialIdea.id} />}
                  </label>
                </div>

                <fieldset data-step="1" className={`${hiddenClass(1)} space-y-2`}>
                  <legend className="mb-2 text-sm font-medium">Roles y horas</legend>
                  {[...ROLE_PRESETS, ...Array.from({ length: EXTRA_ROWS }, () => "")].map((preset, i) => (
                    <div key={i} className="grid grid-cols-[1fr_5rem_6rem] gap-2">
                      <input name={`role_${i}`} defaultValue={preset} aria-label={`Rol ${i + 1}`} placeholder="Otro rol" className={input} />
                      <input name={`hours_${i}`} type="number" min={0} inputMode="numeric" placeholder="Hs" aria-label={`Horas del rol ${i + 1}`} className={input} />
                      <input name={`rate_${i}`} type="number" min={0} step="0.01" inputMode="decimal" placeholder="USD/h" aria-label={`Tarifa del rol ${i + 1}`} className={input} />
                    </div>
                  ))}
                  <p className="text-xs text-muted">Las filas sin horas se ignoran.</p>
                </fieldset>

                <div data-step="2" className={`${hiddenClass(2)} grid gap-4 md:grid-cols-4`}>
                  <label className="block space-y-1 text-sm font-medium">
                    Descuento %
                    <input
                      name="discountPct"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={0}
                      className={input}
                      onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    />
                  </label>
                  <label className="block space-y-1 text-sm font-medium md:col-span-3">
                    Notas para el cliente
                    <textarea name="notes" rows={4} className={input} />
                  </label>
                </div>

                <div data-step="3" className={`${hiddenClass(3)} space-y-4`}>
                  <div className="rounded-3xl bg-cream p-5">
                    <dl className="grid grid-cols-2 gap-y-2 text-sm">
                      <dt className="text-muted">Horas totales</dt><dd className="text-right font-mono">{totals.totalHours}</dd>
                      <dt className="text-muted">Subtotal</dt><dd className="text-right font-mono">{money(totals.subtotal)}</dd>
                      <dt className="text-muted">Descuento</dt><dd className="text-right font-mono">{discount}%</dd>
                      <dt className="font-semibold">Total</dt><dd className="text-right font-mono text-lg font-semibold text-accent">{money(totals.total)}</dd>
                    </dl>
                  </div>
                  <ul className="flex flex-wrap gap-2 text-sm">
                    {summary.map((i) => (
                      <li key={i.role} className="rounded-full bg-accent-soft px-3 py-1 text-accent">
                        {i.role} · {i.hours} hs
                      </li>
                    ))}
                    {summary.length === 0 && <li className="text-muted">Todavía no cargaste horas en el equipo.</li>}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-auto space-y-3 border-t border-line pt-4">
              <FormError message={error} />
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className={`${buttonBase} border border-line bg-surface text-ink disabled:opacity-40`}
              >
                <ChevronLeft size={16} aria-hidden /> Atrás
              </button>
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className={`${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`}>
                  Siguiente <ChevronRight size={16} aria-hidden />
                </button>
              ) : (
                <SubmitButton pendingLabel="Creando propuesta…">Crear propuesta</SubmitButton>
              )}
            </div>
            </div>
            </PendingContext.Provider>
          </form>
        </div>
      </Modal>
    </>
  );
}
