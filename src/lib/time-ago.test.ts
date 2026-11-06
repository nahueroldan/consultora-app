import { describe, expect, it } from "vitest";
import { timeAgo } from "@/lib/time-ago";

const now = new Date("2026-11-06T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms);

describe("timeAgo", () => {
  it("menos de un minuto", () => {
    expect(timeAgo(ago(20_000), now)).toBe("hace un momento");
  });
  it("minutos y horas", () => {
    expect(timeAgo(ago(5 * 60_000), now)).toBe("hace 5 min");
    expect(timeAgo(ago(3 * 3_600_000), now)).toBe("hace 3 h");
  });
  it("días, en singular y plural", () => {
    expect(timeAgo(ago(86_400_000), now)).toBe("hace 1 día");
    expect(timeAgo(ago(2 * 86_400_000), now)).toBe("hace 2 días");
  });
});
