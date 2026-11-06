import { describe, expect, it } from "vitest";
import { isProjectStatus } from "@/lib/data/projects";

describe("isProjectStatus", () => {
  it("acepta estados válidos", () => {
    expect(isProjectStatus("activo")).toBe(true);
  });
  it("rechaza estados inventados", () => {
    expect(isProjectStatus("pausado")).toBe(false);
  });
});
