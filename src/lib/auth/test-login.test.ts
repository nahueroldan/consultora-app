import { describe, expect, it } from "vitest";
import { testLoginEnabled } from "@/lib/auth/test-login";

describe("testLoginEnabled", () => {
  it("solo en desarrollo con la variable activa", () => {
    expect(testLoginEnabled({ NODE_ENV: "development", E2E_TEST_LOGIN: "1" })).toBe(true);
  });
  it("nunca en producción", () => {
    expect(testLoginEnabled({ NODE_ENV: "production", E2E_TEST_LOGIN: "1" })).toBe(false);
  });
  it("nunca en un deploy de Vercel", () => {
    expect(testLoginEnabled({ NODE_ENV: "development", E2E_TEST_LOGIN: "1", VERCEL: "1" })).toBe(false);
    expect(testLoginEnabled({ NODE_ENV: "development", E2E_TEST_LOGIN: "1", VERCEL_ENV: "preview" })).toBe(false);
  });
  it("apagado sin la variable", () => {
    expect(testLoginEnabled({ NODE_ENV: "development" })).toBe(false);
  });
});
