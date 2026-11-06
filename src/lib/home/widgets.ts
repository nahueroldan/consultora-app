// Widgets del inicio: catálogo, configuración por usuario y normalización.
// La configuración viene de la base como JSON no confiable: se valida antes de usarla.

export const WIDGET_IDS = [
  "ideas-top",
  "ideas-por-estado",
  "ideas-mias",
  "propuestas-recientes",
  "proyectos-activos",
  "accesos",
] as const;
export type WidgetId = (typeof WIDGET_IDS)[number];

export const IDEA_SOURCES = ["todas", "mias", "cerradas"] as const;
export type IdeaSource = (typeof IDEA_SOURCES)[number];

export type WidgetConfig = {
  id: WidgetId;
  enabled: boolean;
  /** Cuántos elementos mostrar (solo en widgets de lista). */
  count: number;
  /** Fuente de las ideas (solo en widgets de ideas). */
  source: IdeaSource;
};

export const WIDGET_META: Record<WidgetId, { label: string; kind: "interactivo" | "informativo"; hasCount: boolean; hasSource: boolean }> = {
  "ideas-top": { label: "Ideas más votadas", kind: "interactivo", hasCount: true, hasSource: true },
  "ideas-por-estado": { label: "Ideas por estado", kind: "informativo", hasCount: false, hasSource: false },
  "ideas-mias": { label: "Mis ideas", kind: "interactivo", hasCount: true, hasSource: false },
  "propuestas-recientes": { label: "Propuestas recientes", kind: "informativo", hasCount: true, hasSource: false },
  "proyectos-activos": { label: "Proyectos activos", kind: "informativo", hasCount: false, hasSource: false },
  accesos: { label: "Accesos rápidos", kind: "interactivo", hasCount: false, hasSource: false },
};

export const MIN_COUNT = 1;
export const MAX_COUNT = 10;
export const DEFAULT_COUNT = 3;

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "ideas-top", enabled: true, count: 3, source: "todas" },
  { id: "ideas-por-estado", enabled: true, count: DEFAULT_COUNT, source: "todas" },
  { id: "propuestas-recientes", enabled: true, count: 3, source: "todas" },
  { id: "proyectos-activos", enabled: true, count: DEFAULT_COUNT, source: "todas" },
  { id: "accesos", enabled: true, count: DEFAULT_COUNT, source: "todas" },
  { id: "ideas-mias", enabled: false, count: 3, source: "mias" },
];

function clampCount(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? Math.round(value) : Number.NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(MAX_COUNT, Math.max(MIN_COUNT, n));
}

/**
 * Normaliza una configuración cruda: descarta widgets desconocidos, completa
 * los que faltan con su valor por defecto y respeta el orden guardado.
 */
export function normalizeWidgets(raw: unknown): WidgetConfig[] {
  const incoming = Array.isArray(raw) ? raw : [];
  const seen = new Set<WidgetId>();
  const result: WidgetConfig[] = [];

  for (const item of incoming) {
    if (!item || typeof item !== "object") continue;
    const { id, enabled, count, source } = item as Record<string, unknown>;
    if (typeof id !== "string" || !(WIDGET_IDS as readonly string[]).includes(id)) continue;
    const widgetId = id as WidgetId;
    if (seen.has(widgetId)) continue;
    seen.add(widgetId);
    const defaults = DEFAULT_WIDGETS.find((d) => d.id === widgetId)!;
    result.push({
      id: widgetId,
      enabled: typeof enabled === "boolean" ? enabled : defaults.enabled,
      count: clampCount(count, defaults.count),
      source: (IDEA_SOURCES as readonly string[]).includes(source as string)
        ? (source as IdeaSource)
        : defaults.source,
    });
  }

  for (const d of DEFAULT_WIDGETS) {
    if (!seen.has(d.id)) result.push({ ...d });
  }
  return result;
}
