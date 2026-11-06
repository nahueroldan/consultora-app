import { describe, expect, it } from "vitest";
import { canonicalSkill, cleanText, matchKey, splitStack } from "@/lib/normalize";

describe("cleanText", () => {
  it("quita espacios sobrantes y colapsa internos", () => {
    expect(cleanText("  Juan   Pérez ")).toBe("Juan Pérez");
  });
  it("devuelve cadena vacía para null o undefined", () => {
    expect(cleanText(null)).toBe("");
    expect(cleanText(undefined)).toBe("");
  });
});

describe("matchKey", () => {
  it("ignora mayúsculas y acentos", () => {
    expect(matchKey("Diseño Gráfico")).toBe(matchKey("diseno grafico"));
  });
});

describe("splitStack", () => {
  it("separa por coma", () => {
    expect(splitStack("React, Node, PostgreSQL")).toEqual(["React", "Node", "PostgreSQL"]);
  });
  it("separa por barra, más, punto y coma y barra vertical", () => {
    expect(splitStack("Java/Spring+Kafka;Redis|Docker")).toEqual([
      "Java",
      "Spring",
      "Kafka",
      "Redis",
      "Docker",
    ]);
  });
  it("no parte CI/CD", () => {
    expect(splitStack("GitHub Actions, CI/CD")).toEqual(["GitHub Actions", "CI/CD"]);
  });
  it("quita vacíos y duplicados", () => {
    expect(splitStack(" React,, React , ")).toEqual(["React"]);
  });
  it("devuelve lista vacía sin stack", () => {
    expect(splitStack(null)).toEqual([]);
    expect(splitStack("   ")).toEqual([]);
  });
});

describe("canonicalSkill", () => {
  it("unifica variantes conocidas", () => {
    expect(canonicalSkill("react.js")).toBe("React");
    expect(canonicalSkill("ReactJS")).toBe("React");
    expect(canonicalSkill("postgres")).toBe("PostgreSQL");
    expect(canonicalSkill("NodeJS")).toBe("Node.js");
  });
  it("deja como está lo que no tiene alias", () => {
    expect(canonicalSkill("  Terraform ")).toBe("Terraform");
  });
});
