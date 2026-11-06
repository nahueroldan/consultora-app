import { expect, test } from "@playwright/test";
import { loginAs } from "./helpers";

const TAG = `E2E ${Date.now()}`;
const EMAIL = `e2e-${Date.now()}@test.local`;

test("flujo completo: idea, voto, comentario, estado y propuesta", async ({ page }) => {
  await loginAs(page, EMAIL, "lider");

  // 1. Crear idea
  await page.goto("/ideas");
  await page.getByRole("button", { name: "Nueva idea" }).click();
  await page.getByLabel("Título").fill(`${TAG} idea`);
  await page.getByLabel("Descripción").fill("Idea creada por la prueba automática");
  await page.getByRole("button", { name: "Guardar idea" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("link", { name: `${TAG} idea` })).toBeVisible();

  // 2. Abrir la idea, votar y comentar
  await page.getByRole("link", { name: `${TAG} idea` }).click();
  await expect(page.getByRole("heading", { name: `${TAG} idea` })).toBeVisible();
  await page.getByRole("button", { name: "Votar esta idea" }).click();
  await expect(page.getByRole("button", { name: "Quitar mi voto" })).toBeVisible();

  await page.getByLabel("Tu comentario").fill("Comentario de prueba");
  await page.getByRole("button", { name: "Comentar" }).click();
  await expect(page.getByText("Comentario de prueba")).toBeVisible();

  // 3. Cambiar estado
  await page.locator('select[name="status"]').selectOption("en_evaluacion");
  await page.getByRole("button", { name: "Cambiar estado" }).click();
  await expect(page.getByText("En evaluación").first()).toBeVisible();

  const ideaUrl = page.url();

  // 4. Crear un proyecto para poder armar la propuesta
  await page.goto("/proyectos");
  await page.getByRole("button", { name: "Nuevo proyecto" }).click();
  await page.getByLabel("Nombre").fill(`${TAG} proyecto`);
  await page.getByRole("button", { name: "Crear proyecto" }).click();
  await expect(page.getByRole("link", { name: `${TAG} proyecto` })).toBeVisible();

  // 5. Crear propuesta desde la idea (el wizard abre con el título cargado)
  await page.goto(ideaUrl);
  await page.getByRole("link", { name: "Crear propuesta desde esta idea" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Título de la propuesta")).toHaveValue(`${TAG} idea`);
  await dialog.getByRole("combobox").first().selectOption({ label: `${TAG} proyecto` });

  await dialog.getByRole("button", { name: "Siguiente" }).click();
  await dialog.getByLabel("Horas del rol 1").fill("10");
  await dialog.getByLabel("Tarifa del rol 1").fill("40");
  await dialog.getByRole("button", { name: "Siguiente" }).click();
  await dialog.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialog.getByText("Revisión").first()).toBeVisible();
  await dialog.getByRole("button", { name: "Crear propuesta" }).click();
  await expect(page).toHaveURL(/\/propuestas\/\d+$/);
  await expect(page.getByRole("heading", { name: `${TAG} idea` })).toBeVisible();

  // 6. La idea queda convertida y vinculada
  await page.goto(ideaUrl);
  await expect(page.getByText("Convertida en propuesta").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver propuesta/ })).toBeVisible();
});
