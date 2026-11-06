import { normalizeWidgets, WIDGET_IDS, type WidgetConfig } from "@/lib/home/widgets";

/** Convierte los campos del formulario de personalización en configuración válida. */
export function widgetsFromForm(fd: FormData): WidgetConfig[] {
  const raw = WIDGET_IDS.map((id) => ({
    id,
    enabled: fd.get(`${id}_enabled`) === "on",
    count: Number(fd.get(`${id}_count`) ?? 3),
    source: String(fd.get(`${id}_source`) ?? "todas"),
  }));
  return normalizeWidgets(raw);
}
