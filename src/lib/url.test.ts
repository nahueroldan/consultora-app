import { describe, expect, it } from "vitest";
import { cleanOptionalUrl } from "@/lib/url";

describe("cleanOptionalUrl", () => {
  it("vacía es válida y queda en null", () => {
    expect(cleanOptionalUrl("   ")).toEqual({ value: null });
  });
  it("acepta https y http", () => {
    expect(cleanOptionalUrl(" https://control-panel.dev ")).toEqual({ value: "https://control-panel.dev" });
    expect(cleanOptionalUrl("http://x.com")).toEqual({ value: "http://x.com" });
  });
  it("rechaza texto sin protocolo", () => {
    expect(cleanOptionalUrl("control-panel.dev")).toHaveProperty("error");
    expect(cleanOptionalUrl("javascript:alert(1)")).toHaveProperty("error");
  });
});
