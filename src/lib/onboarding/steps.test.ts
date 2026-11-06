import { describe, expect, it } from "vitest";
import { TOUR_STEPS, tourStepsFor } from "@/lib/onboarding/steps";

describe("tourStepsFor", () => {
  it("colaborador ve solo los pasos generales", () => {
    const ids = tourStepsFor("colaborador").map((s) => s.id);
    expect(ids).not.toContain("proyectos");
    expect(ids).not.toContain("usuarios");
    expect(ids).toContain("inicio");
  });
  it("líder ve proyectos y estado de ideas, pero no usuarios", () => {
    const ids = tourStepsFor("lider").map((s) => s.id);
    expect(ids).toContain("proyectos");
    expect(ids).toContain("estado-ideas");
    expect(ids).not.toContain("usuarios");
  });
  it("admin ve todos los pasos", () => {
    expect(tourStepsFor("admin")).toHaveLength(TOUR_STEPS.length);
  });
  it("sin rol ve solo los generales", () => {
    expect(tourStepsFor(null).every((s) => !s.roles)).toBe(true);
  });
  it("cada paso tiene una ruta válida", () => {
    expect(TOUR_STEPS.every((s) => s.href.startsWith("/"))).toBe(true);
  });
  it("los destinos de foco son únicos", () => {
    const targets = TOUR_STEPS.map((s) => s.target).filter(Boolean);
    expect(new Set(targets).size).toBe(targets.length);
  });
  it("los ids son únicos", () => {
    const ids = TOUR_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
