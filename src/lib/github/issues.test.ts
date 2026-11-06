import { describe, expect, it } from "vitest";
import { buildIssueBody } from "@/lib/github/issues";

describe("buildIssueBody", () => {
  it("incluye descripción, quién lo reportó y en qué página", () => {
    const body = buildIssueBody({
      description: "  El botón no responde  ",
      reporterEmail: "ana@test.com",
      role: "colaborador",
      page: "/ideas/3",
    });
    expect(body.startsWith("El botón no responde")).toBe(true);
    expect(body).toContain("Reportado por: ana@test.com");
    expect(body).toContain("Página: /ideas/3");
    expect(body).toContain("Rol: colaborador");
  });
  it("sin rol lo indica", () => {
    expect(buildIssueBody({ description: "x", reporterEmail: "a@b.c", role: null, page: "/" })).toContain("Rol: sin rol");
  });
});
