import { describe, expect, it } from "vitest";
import { buildProposalPdf, wrap } from "@/lib/proposals/pdf";
import { computeProposalTotals } from "@/lib/proposals/total";

describe("wrap", () => {
  it("corta por ancho máximo sin partir palabras", () => {
    expect(wrap("uno dos tres cuatro", 9)).toEqual(["uno dos", "tres", "cuatro"]);
  });
  it("respeta saltos de línea", () => {
    expect(wrap("a\nb", 10)).toEqual(["a", "b"]);
  });
});

describe("buildProposalPdf", () => {
  it("genera un PDF válido", async () => {
    const items = [{ role: "Dev Frontend", hours: 120, hourlyRate: 40 }];
    const bytes = await buildProposalPdf({
      title: "Propuesta de prueba",
      projectName: "Proyecto X",
      client: "Cliente Ñandú",
      createdAt: new Date("2026-11-06"),
      items,
      totals: computeProposalTotals(items, 10),
      discountPct: 10,
      notes: "Notas de prueba con varias palabras para el wrap.",
    });
    const header = new TextDecoder().decode(bytes.slice(0, 5));
    expect(header).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(500);
  });
});
