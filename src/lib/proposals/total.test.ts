import { describe, expect, it } from "vitest";
import { computeProposalTotals } from "@/lib/proposals/total";

describe("computeProposalTotals", () => {
  it("suma horas por tarifa sin descuento", () => {
    const t = computeProposalTotals([
      { role: "Dev", hours: 100, hourlyRate: 40 },
      { role: "QA", hours: 50, hourlyRate: 30 },
    ]);
    expect(t).toEqual({ subtotal: 5500, discount: 0, total: 5500, totalHours: 150 });
  });

  it("aplica descuento porcentual", () => {
    const t = computeProposalTotals([{ role: "Dev", hours: 100, hourlyRate: 40 }], 10);
    expect(t.discount).toBe(400);
    expect(t.total).toBe(3600);
  });

  it("redondea a centavos", () => {
    const t = computeProposalTotals([{ role: "Dev", hours: 1, hourlyRate: 33.333 }], 0);
    expect(t.subtotal).toBe(33.33);
  });

  it("propuesta vacía da cero", () => {
    expect(computeProposalTotals([])).toEqual({ subtotal: 0, discount: 0, total: 0, totalHours: 0 });
  });

  it("rechaza descuentos fuera de rango", () => {
    expect(() => computeProposalTotals([], 101)).toThrow(RangeError);
    expect(() => computeProposalTotals([], -1)).toThrow(RangeError);
  });

  it("rechaza horas o tarifas negativas", () => {
    expect(() => computeProposalTotals([{ role: "Dev", hours: -1, hourlyRate: 10 }])).toThrow(RangeError);
  });
});
