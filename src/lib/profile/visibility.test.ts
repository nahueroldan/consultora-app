import { describe, expect, it } from "vitest";
import { canSeeField, DEFAULT_VISIBILITY, normalizeVisibility } from "@/lib/profile/visibility";

const others = { personId: 99, role: "colaborador" };

describe("normalizeVisibility", () => {
  it("sin dato devuelve todo visible", () => {
    expect(normalizeVisibility(null)).toEqual(DEFAULT_VISIBILITY);
  });
  it("respeta lo que está marcado y completa lo que falta", () => {
    const v = normalizeVisibility({ linkedin: false, city: "no" });
    expect(v.linkedin).toBe(false);
    expect(v.city).toBe(true);
  });
});

describe("canSeeField", () => {
  const hidden = { ...DEFAULT_VISIBILITY, linkedin: false };
  it("otra persona no ve lo oculto", () => {
    expect(canSeeField(1, "linkedin", hidden, others)).toBe(false);
  });
  it("otra persona ve lo visible", () => {
    expect(canSeeField(1, "position", hidden, others)).toBe(true);
  });
  it("el dueño ve todo", () => {
    expect(canSeeField(1, "linkedin", hidden, { personId: 1, role: "colaborador" })).toBe(true);
  });
  it("el admin ve todo", () => {
    expect(canSeeField(1, "linkedin", hidden, { personId: 7, role: "admin" })).toBe(true);
  });
});
