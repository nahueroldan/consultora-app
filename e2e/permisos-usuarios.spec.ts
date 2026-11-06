import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

test("un colaborador no ve Gestión de usuarios ni puede abrir la página", async ({ page }) => {
  await loginAs(page, `e2e-col-${Date.now()}@test.local`, "colaborador");

  await page.getByRole("button", { name: "Configuración" }).click();
  await expect(page.getByRole("menuitem", { name: /Gestión de usuarios/ })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.goto("/usuarios");
  await expect(page).toHaveURL(/\/$/);
});

test("un admin sí ve Gestión de usuarios", async ({ page }) => {
  await loginAs(page, `e2e-adm-${Date.now()}@test.local`, "admin");

  await page.getByRole("button", { name: "Configuración" }).click();
  await expect(page.getByRole("menuitem", { name: /Gestión de usuarios/ })).toBeVisible();
});
