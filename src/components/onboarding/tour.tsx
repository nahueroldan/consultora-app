"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, FileText, FolderKanban, Home, LayoutGrid, Lightbulb, Settings, Shield, Users, type LucideIcon } from "lucide-react";
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

const CARD_WIDTH = 340;
const CARD_GAP = 16;
const PAD = 8;

type TourContextValue = { openTour: () => void };
const TourContext = createContext<TourContextValue>({ openTour: () => {} });

/** Permite abrir el recorrido desde cualquier parte de la app (por ejemplo, el menú). */
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
  autoOpen: boolean;
  closeAction: () => Promise<ActionResult>;
  children: ReactNode;
}) {
  const [active, setActive] = useState(autoOpen);
  const [index, setIndex] = useState(0);

  const openTour = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  // Terminar u omitir marca el recorrido como visto: no vuelve a abrirse solo.
  const close = useCallback(() => {
    setActive(false);
    void closeAction();
  }, [closeAction]);

  return (
    <TourContext.Provider value={{ openTour }}>
      {children}
      {active && steps.length > 0 && (
        <Spotlight key={index} steps={steps} index={index} setIndex={setIndex} onClose={close} />
      )}
    </TourContext.Provider>
  );
}

type Box = { top: number; left: number; width: number; height: number };

function measure(target: string | undefined): Box | null {
  if (!target) return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function Spotlight({
  steps,
  index,
  setIndex,
  onClose,
}: {
  steps: TourStep[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const step = steps[index];
  const [box, setBox] = useState<Box | null>(null);
  const [searching, setSearching] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  // Navega a la página del paso y espera a que el elemento exista.
  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    const tick = () => {
      if (cancelled) return;
      const found = measure(step.target);
      // Hasta ~8 s: la sección puede tardar en cargar sus datos antes de tener el elemento.
      if (found || !step.target || tries > 80) {
        if (found) {
          const el = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
          el?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
        }
        setBox(found ? measure(step.target) : null);
        setSearching(false);
        return;
      }
      tries++;
      setTimeout(tick, 100);
    };
    const first = setTimeout(tick, 150);
    return () => {
      cancelled = true;
      clearTimeout(first);
    };
    // El paso define qué buscar; reduce no cambia el destino.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.target]);

  // Recalcula la posición al cambiar la ventana o al desplazar.
  useEffect(() => {
    const update = () => setBox(measure(step.target));
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step.target]);

  // Navega a la sección del paso solo cuando el usuario avanza o retrocede.
  const goTo = useCallback(
    (i: number) => {
      const target = steps[i];
      if (target.href !== pathname) router.push(target.href);
      setIndex(i);
    },
    [steps, pathname, router, setIndex],
  );

  // Precarga la sección del siguiente paso mientras el usuario lee el actual.
  useEffect(() => {
    const next = steps[index + 1];
    if (next && next.href !== pathname) router.prefetch(next.href);
  }, [index, steps, pathname, router]);

  // Escape cierra; las flechas avanzan y retroceden.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < steps.length - 1) goTo(index + 1);
      if (e.key === "ArrowLeft" && index > 0) goTo(index - 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, steps.length, goTo, onClose]);

  // Lleva el foco al botón principal para que el teclado siga el recorrido.
  useEffect(() => {
    if (!searching) nextRef.current?.focus();
  }, [searching, index]);

  const last = index === steps.length - 1;
  const Icon = ICONS[step.icon];
  const hasBox = box !== null && !searching;
  // El globo se muestra recién cuando ya sabe dónde va: evita el salto desde el centro.

  // Siempre con top/left para que el paso entre posiciones se anime.
  const cardStyle = placeCard(hasBox ? box : null);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="false" aria-label="Recorrido de la app">
      {hasBox ? (
        <div
          aria-hidden
          className="pointer-events-none fixed rounded-2xl transition-all duration-300"
          style={{
            top: box.top - PAD,
            left: box.left - PAD,
            width: box.width + PAD * 2,
            height: box.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgb(9 9 11 / 0.6)",
            outline: "2px solid var(--accent)",
          }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none fixed inset-0 bg-black/30 transition-colors duration-300" />
      )}

      <div
        ref={cardRef}
        style={cardStyle}
        className={`fixed z-10 w-[min(340px,calc(100vw-2rem))] rounded-3xl border border-line bg-surface p-5 shadow-2xl transition-[top,left] duration-300 ease-out`}
      >
        <div className="mb-4 flex gap-1.5" aria-hidden>
          {steps.map((s, i) => (
            <span key={s.id} className={`h-1 flex-1 rounded-full ${i <= index ? "bg-accent" : "bg-line"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step.id}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <Icon size={20} aria-hidden />
            </span>
            <h3 className="font-display text-xl">{step.title}</h3>
            <p className="text-sm leading-relaxed text-muted">{step.body}</p>
            {searching && step.target && (
              <p className="flex items-center gap-2 pt-1 text-xs text-muted" role="status">
                <span aria-hidden className="size-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
                Abriendo la sección…
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
          <button type="button" onClick={onClose} className="text-sm text-muted hover:text-ink">
            Omitir
          </button>
          <div className="flex items-center gap-2">
            <span className="mr-1 font-mono text-xs text-muted">
              {index + 1}/{steps.length}
            </span>
            <button
              type="button"
              onClick={() => goTo(Math.max(0, index - 1))}
              disabled={index === 0}
              aria-label="Paso anterior"
              className="inline-flex size-9 items-center justify-center rounded-2xl border border-line bg-surface disabled:opacity-40"
            >
              <ArrowLeft size={16} aria-hidden />
            </button>
            {last ? (
              <button ref={nextRef} type="button" onClick={onClose} className="inline-flex min-h-9 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover">
                <Check size={16} aria-hidden /> Terminar
              </button>
            ) : (
              <button ref={nextRef} type="button" onClick={() => goTo(index + 1)} className="inline-flex min-h-9 items-center gap-2 rounded-2xl bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover">
                Siguiente <ArrowRight size={16} aria-hidden />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Ubica el globo debajo del elemento o encima si no hay lugar.
 * Sin elemento todavía, queda anclado abajo a la derecha (en móvil, abajo al centro).
 */
function placeCard(box: Box | null): React.CSSProperties {
  const estimatedHeight = 230;
  if (typeof window === "undefined") return { top: 0, left: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(CARD_WIDTH, vw - 32);
  if (!box) {
    const left = vw >= 768 ? vw - width - 24 : Math.max(16, (vw - width) / 2);
    return { top: Math.max(16, vh - estimatedHeight - 24), left };
  }
  const left = Math.min(Math.max(16, box.left), vw - width - 16);
  const spaceBelow = vh - (box.top + box.height);
  if (spaceBelow > estimatedHeight + CARD_GAP) {
    return { top: box.top + box.height + CARD_GAP, left };
  }
  return { top: Math.max(16, box.top - estimatedHeight - CARD_GAP), left };
}
