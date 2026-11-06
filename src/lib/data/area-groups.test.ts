import { describe, expect, it } from "vitest";
import { groupOfArea, OTHER_GROUP } from "@/lib/data/area-groups";

describe("groupOfArea", () => {
  it("une diseño y UX aunque el nombre cambie de formato", () => {
    expect(groupOfArea("Diseño")).toBe("Diseño y UX");
    expect(groupOfArea("UX")).toBe("Diseño y UX");
    expect(groupOfArea("Diseño UX / UI")).toBe("Diseño y UX");
    expect(groupOfArea("Diseño UX/UI")).toBe("Diseño y UX");
  });

  it("une variantes de SRE y NOC", () => {
    expect(groupOfArea("SRE - NOC")).toBe("Infraestructura y operaciones");
    expect(groupOfArea("sre/noc")).toBe("Infraestructura y operaciones");
  });

  it("separa IT general del resto", () => {
    expect(groupOfArea("IT")).toBe("IT general");
    expect(groupOfArea("It")).toBe("IT general");
  });

  it("áreas sin grupo van a Otros", () => {
    expect(groupOfArea("Área inventada")).toBe(OTHER_GROUP);
  });
});
