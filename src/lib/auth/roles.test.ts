import { describe, expect, it } from "vitest";
import { ForbiddenError, assertCan, can } from "@/lib/auth/roles";

describe("can", () => {
  it("colaborador solo puede ver el directorio", () => {
    expect(can("colaborador", "directorio:ver")).toBe(true);
    expect(can("colaborador", "squad:editar")).toBe(false);
    expect(can("colaborador", "proyecto:editar")).toBe(false);
    expect(can("colaborador", "idea:editar")).toBe(false);
  });

  it("líder puede editar squads, proyectos e ideas, pero no gestionar usuarios", () => {
    expect(can("lider", "squad:editar")).toBe(true);
    expect(can("lider", "proyecto:editar")).toBe(true);
    expect(can("lider", "idea:editar")).toBe(true);
    expect(can("lider", "propuesta:crear")).toBe(true);
    expect(can("lider", "usuario:gestionar")).toBe(false);
  });

  it("admin puede todo", () => {
    expect(can("admin", "usuario:gestionar")).toBe(true);
    expect(can("admin", "squad:editar")).toBe(true);
  });

  it("rol desconocido o ausente no tiene permisos", () => {
    expect(can("invitado", "directorio:ver")).toBe(false);
    expect(can(null, "directorio:ver")).toBe(false);
    expect(can(undefined, "directorio:ver")).toBe(false);
  });
});

describe("assertCan", () => {
  it("no lanza si tiene permiso", () => {
    expect(() => assertCan("lider", "squad:editar")).not.toThrow();
  });
  it("lanza ForbiddenError si no tiene permiso", () => {
    expect(() => assertCan("colaborador", "squad:editar")).toThrow(ForbiddenError);
  });
});
