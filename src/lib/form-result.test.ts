import { describe, expect, it } from "vitest";
import { fail, ok, requiredText, safeAction } from "@/lib/form-result";

describe("requiredText", () => {
  it("quita espacios y acepta texto real", () => {
    expect(requiredText("  Idea nueva  ", "El título")).toEqual({ value: "Idea nueva" });
  });
  it("rechaza texto solo con espacios", () => {
    expect(requiredText("   ", "El título")).toEqual({ error: "El título es obligatorio." });
  });
  it("rechaza valores vacíos o nulos", () => {
    expect(requiredText(null, "El nombre")).toEqual({ error: "El nombre es obligatorio." });
    expect(requiredText("", "El nombre")).toEqual({ error: "El nombre es obligatorio." });
  });
});

describe("safeAction", () => {
  it("devuelve el resultado de la acción si sale bien", async () => {
    expect(await safeAction(async () => ok())).toEqual({ ok: true });
  });
  it("convierte un permiso denegado en mensaje", async () => {
    const err = Object.assign(new Error("Sin permiso"), { name: "ForbiddenError" });
    expect(await safeAction(async () => { throw err; })).toEqual(fail("No tenés permiso para hacer esta acción."));
  });
  it("convierte un error inesperado en mensaje genérico", async () => {
    const result = await safeAction(async () => { throw new Error("boom"); });
    expect(result).toEqual(fail("No se pudo guardar. Revisá la conexión y probá de nuevo."));
  });
  it("deja pasar los redirects", async () => {
    const redirectErr = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/x" });
    await expect(safeAction(async () => { throw redirectErr; })).rejects.toBe(redirectErr);
  });
});
