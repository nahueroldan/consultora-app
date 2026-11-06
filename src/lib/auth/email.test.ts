import { describe, expect, it } from "vitest";
import { normalizeEmail } from "@/lib/auth/email";

describe("normalizeEmail", () => {
  it("pasa a minúsculas y quita espacios", () => {
    expect(normalizeEmail("  Nahue@Gmail.com ")).toBe("nahue@gmail.com");
  });
  it("rechaza vacío, nulo o sin arroba", () => {
    expect(normalizeEmail("")).toBeNull();
    expect(normalizeEmail(null)).toBeNull();
    expect(normalizeEmail("no-es-mail")).toBeNull();
  });
});
