import { describe, expect, it } from "vitest";
import { widgetsFromForm } from "@/lib/home/parse-form";

describe("widgetsFromForm", () => {
  it("lee activación, cantidad y fuente de cada widget", () => {
    const fd = new FormData();
    fd.set("ideas-top_enabled", "on");
    fd.set("ideas-top_count", "5");
    fd.set("ideas-top_source", "cerradas");
    const top = widgetsFromForm(fd).find((w) => w.id === "ideas-top")!;
    expect(top).toEqual({ id: "ideas-top", enabled: true, count: 5, source: "cerradas" });
  });

  it("un checkbox sin marcar deja el widget desactivado", () => {
    const fd = new FormData();
    const accesos = widgetsFromForm(fd).find((w) => w.id === "accesos")!;
    expect(accesos.enabled).toBe(false);
  });
});
