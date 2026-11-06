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
  // Cuentas nuevas sin perfil ven "¿Sos vos?" encima de todo: la cerramos primero.
  const gate = page.getByRole("dialog", { name: "¿Sos vos?" });
  if (await gate.waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false)) {
    await page.keyboard.press("Escape");
    await gate.waitFor({ state: "hidden" });
  }
  // Después, el recorrido: lo omitimos para no tapar la app.
  const skip = page.getByRole("button", { name: "Omitir" });
  if (await skip.waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false)) {
    await skip.click();
  }
}
