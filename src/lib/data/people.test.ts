import { describe, expect, it } from "vitest";
import { parseDirectoryFilters } from "@/lib/data/people";

describe("parseDirectoryFilters", () => {
  it("toma valores de la URL y descarta vacíos", () => {
    const f = parseDirectoryFilters({ q: "  ana ", area: "", skill: ["React", "x"] }, false);
    expect(f).toEqual({ q: "ana", area: undefined, skill: "React", includePending: false });
  });
  it("respeta includePending", () => {
    expect(parseDirectoryFilters({}, true).includePending).toBe(true);
  });
});
