"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, FolderKanban, Home, Lightbulb, Settings, Shield, FileText, LayoutGrid, Users, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { buttonBase } from "@/components/ui/button";
import type { TourIcon, TourStep } from "@/lib/onboarding/steps";
import type { ActionResult } from "@/lib/form-result";

const ICONS: Record<TourIcon, LucideIcon> = {
  home: Home,
  widgets: LayoutGrid,
  users: Users,
  lightbulb: Lightbulb,
  file: FileText,
  folder: FolderKanban,
  settings: Settings,
  shield: Shield,
};

type TourContextValue = { openTour: () => void };
const TourContext = createContext<TourContextValue>({ openTour: () => {} });

/** Permite a cualquier parte de la app (por ejemplo, el menú) abrir el recorrido otra vez. */
export function useTour() {
  return useContext(TourContext);
}

export function TourProvider({
  steps,
  autoOpen,
  closeAction,
  children,
}: {
  steps: TourStep[];
  /** Se abre solo si el usuario todavía no cerró el recorrido. */
  autoOpen: boolean;
  closeAction: () => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(autoOpen);
  const [index, setIndex] = useState(0);

  const openTour = useCallback(() => {
    setIndex(0);
    setOpen(true);
  }, []);

  // Cerrar (terminar u omitir) marca el recorrido como visto: no vuelve a abrirse solo.
  const close = useCallback(() => {
    setOpen(false);
    void closeAction();
  }, [closeAction]);

  return (
    <TourContext.Provider value={{ openTour }}>
      {children}
      <Modal open={open} onClose={close} title="Recorrido" description={`Paso ${index + 1} de ${steps.length}`} size="md">
        <TourBody steps={steps} index={index} setIndex={setIndex} onFinish={close} />
      </Modal>
    </TourContext.Provider>
  );
}

function TourBody({
  steps,
  index,
  setIndex,
  onFinish,
}: {
  steps: TourStep[];
  index: number;
  setIndex: (i: number) => void;
  onFinish: () => void;
}) {
  const reduce = useReducedMotion();
  const step = steps[index];
  const Icon = ICONS[step.icon];
  const last = index === steps.length - 1;

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex gap-1.5" aria-hidden>
        {steps.map((s, i) => (
          <span key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step.id}
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col items-start gap-4"
        >
          <span className="flex size-14 items-center justify-center rounded-3xl bg-accent-soft text-accent">
            <Icon size={26} aria-hidden />
          </span>
          <h3 className="font-display text-2xl">{step.title}</h3>
          <p className="leading-relaxed text-muted">{step.body}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <button type="button" onClick={onFinish} className="text-sm text-muted hover:text-ink">
          Omitir
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            aria-label="Paso anterior"
            className={`${buttonBase} border border-line bg-surface px-3 disabled:opacity-40`}
          >
            <ArrowLeft size={16} aria-hidden />
          </button>
          {last ? (
            <button type="button" onClick={onFinish} className={`${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`}>
              <Check size={16} aria-hidden /> Terminar
            </button>
          ) : (
            <button type="button" onClick={() => setIndex(index + 1)} className={`${buttonBase} bg-accent text-on-accent hover:bg-accent-hover`}>
              Siguiente <ArrowRight size={16} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
