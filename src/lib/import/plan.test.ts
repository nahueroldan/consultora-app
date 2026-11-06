import { describe, expect, it } from "vitest";
import { buildImportPlan, importFileSchema } from "@/lib/import/plan";

const sample = {
  people: [
    { pais: "Argentina", nombre: " Ana ", apellido: "Gómez", area: "Desarrollo", puesto: "Dev", rol: "Frontend", ubicacion: "", stack: "React.js, Node/Postgres", linkedin: "" },
    { pais: "Chile", nombre: "Luis", apellido: "Pérez", area: null, puesto: null, rol: null, ubicacion: "Santiago", stack: null, linkedin: null },
    { pais: "Chile", nombre: "luis", apellido: "PÉREZ", area: null, puesto: null, rol: null, ubicacion: null, stack: "ReactJS", linkedin: null },
  ],
};

describe("importFileSchema", () => {
  it("acepta la estructura del portal", () => {
    expect(importFileSchema.safeParse(sample).success).toBe(true);
  });
  it("rechaza personas sin nombre", () => {
    const bad = { people: [{ apellido: "X" }] };
    expect(importFileSchema.safeParse(bad).success).toBe(false);
  });
});

describe("buildImportPlan", () => {
  const plan = buildImportPlan(importFileSchema.parse(sample));

  it("normaliza nombres y vacíos a null", () => {
    expect(plan.people[0].firstName).toBe("Ana");
    expect(plan.people[0].city).toBeNull();
    expect(plan.people[0].linkedin).toBeNull();
  });

  it("separa el stack en skills canónicas", () => {
    expect(plan.people[0].skills).toEqual(["React", "Node.js", "PostgreSQL"]);
  });

  it("no pisa personas con mismo nombre: usa número de aparición", () => {
    expect(plan.people[1].externalKey).toBe("luis|perez#1");
    expect(plan.people[2].externalKey).toBe("luis|perez#2");
  });

  it("marca como posible duplicado el par con mismo nombre y apellido", () => {
    expect(plan.possibleDuplicates).toEqual(["luis|perez"]);
  });

  it("lista las skills distintas ordenadas", () => {
    expect(plan.skillNames).toEqual(["Node.js", "PostgreSQL", "React"]);
  });
});
