import type { Page } from "@playwright/test";

/** Inicia sesión con el acceso de prueba (solo disponible en desarrollo). */
export async function loginAs(page: Page, email: string, role: "admin" | "lider" | "colaborador") {
  const csrf = await page.request.get("/api/auth/csrf");
  const { csrfToken } = (await csrf.json()) as { csrfToken: string };
  const res = await page.request.post("/api/auth/callback/test", {
    form: { csrfToken, email, role, json: "true" },
  });
  if (!res.ok()) throw new Error(`Login de prueba falló: ${res.status()}`);
  await page.goto("/");
}
