import { describe, expect, it } from "vitest";
import { DEFAULT_WIDGETS, MAX_COUNT, normalizeWidgets, WIDGET_IDS } from "@/lib/home/widgets";

describe("normalizeWidgets", () => {
  it("sin configuración devuelve los widgets por defecto", () => {
    expect(normalizeWidgets(null)).toEqual(DEFAULT_WIDGETS);
    expect(normalizeWidgets("basura")).toEqual(DEFAULT_WIDGETS);
  });

  it("descarta widgets desconocidos y duplicados", () => {
    const out = normalizeWidgets([
      { id: "no-existe", enabled: true, count: 1, source: "todas" },
      { id: "accesos", enabled: false, count: 2, source: "todas" },
      { id: "accesos", enabled: true, count: 5, source: "todas" },
    ]);
    expect(out.filter((w) => w.id === "accesos")).toEqual([{ id: "accesos", enabled: false, count: 2, source: "todas" }]);
    expect(out.some((w) => (w.id as string) === "no-existe")).toBe(false);
  });

  it("limita la cantidad y valida la fuente", () => {
    const out = normalizeWidgets([{ id: "ideas-top", enabled: true, count: 999, source: "otra" }]);
    const top = out.find((w) => w.id === "ideas-top")!;
    expect(top.count).toBe(MAX_COUNT);
    expect(top.source).toBe("todas");
  });

  it("completa los widgets que faltan y respeta el orden guardado", () => {
    const out = normalizeWidgets([{ id: "proyectos-activos", enabled: true, count: 2, source: "todas" }]);
    expect(out[0].id).toBe("proyectos-activos");
    expect(out.map((w) => w.id).sort()).toEqual([...WIDGET_IDS].sort());
  });
});
