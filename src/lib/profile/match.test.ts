import { describe, expect, it } from "vitest";
import { nameTokens, rankCandidates } from "@/lib/profile/match";

const people = [
  { id: 1, firstName: "Ana", lastName: "Gómez", position: null },
  { id: 2, firstName: "Nahuel", lastName: "Roldán", position: "Dev" },
  { id: 3, firstName: "Nahuel", lastName: "Pérez", position: null },
  { id: 4, firstName: "Luis", lastName: "Gómez", position: null },
];

describe("nameTokens", () => {
  it("normaliza acentos, mayúsculas y descarta letras sueltas", () => {
    expect(nameTokens("Nahuel  ROLDÁN J.")).toEqual(["nahuel", "roldan"]);
  });
});

describe("rankCandidates", () => {
  it("pone primero al perfil con nombre y apellido completos", () => {
    const out = rankCandidates("Nahuel Roldán", people);
    expect(out[0].id).toBe(2);
  });
  it("incluye coincidencias parciales, pero no las que no tienen nada en común", () => {
    const out = rankCandidates("Nahuel Roldán", people).map((p) => p.id);
    expect(out).toContain(3);
    expect(out).not.toContain(1);
  });
  it("sin nombre no hay candidatos", () => {
    expect(rankCandidates(null, people)).toEqual([]);
  });
  it("respeta el límite", () => {
    expect(rankCandidates("Gómez", people, 1)).toHaveLength(1);
  });
});
