import { expect, test } from "@playwright/test";
import { ADMIN_STORAGE_STATE, AUTHOR_STORAGE_STATE } from "./testUsers";

test.describe("Cronología completa de una civilización", () => {
  test("se llega desde la página de Roma y las etapas abren bandas con su resumen", async ({ page }) => {
    await page.goto("/roma");

    await page.getByRole("link", { name: /Cronología completa/ }).click();
    await expect(page).toHaveURL("/roma/cronologia");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cronología de Roma");
    await expect(page.getByRole("heading", { level: 2, name: "La Monarquía romana" })).toBeVisible();
  });

  test("un hito lleva a su tema, y uno sin tema invita a proponerlo", async ({ page }) => {
    await page.goto("/roma/cronologia");
    const milestone = (title: string) =>
      page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3, name: title }) });

    await expect(milestone("Primera guerra púnica").getByText("Aún sin tema")).toBeVisible();
    await expect(milestone("Primera guerra púnica").getByRole("link", { name: "Proponerlo" })).toHaveAttribute(
      "href",
      "/mi-biblioteca/propuestas?tipo=tema-nuevo",
    );

    await milestone("Fundación de Roma").getByRole("link", { name: /Rómulo y la fundación de Roma/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rómulo y la fundación de Roma");
  });

  test("los eventos de los temas solo aparecen al pedirlos, y llevan al evento dentro de su tema", async ({ page }) => {
    await page.goto("/roma/cronologia");
    // "Cruce del Rubicón" es un evento del tema de César; el hito equivalente se llama distinto.
    await expect(page.getByRole("heading", { name: "Cruce del Rubicón", exact: true })).toHaveCount(0);

    await page.getByRole("link", { name: /Con los eventos de los temas/ }).click();
    await expect(page).toHaveURL("/roma/cronologia?eventos=todos");

    const rubicon = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Cruce del Rubicón", exact: true }) });
    await rubicon.getByRole("link", { name: /Julio César/ }).click();
    await expect(page).toHaveURL(/\/roma\/personajes\/julio-cesar#evento-/);
  });

  test("una civilización inexistente responde 404", async ({ page }) => {
    const response = await page.goto("/atlantida/cronologia");

    expect(response?.status()).toBe(404);
  });
});

test.describe("Editor de la cronología en el panel", () => {
  test("sin sesión, pide iniciar sesión y vuelve al editor", async ({ page }) => {
    await page.goto("/admin/cronologia/roma");

    await expect(page).toHaveURL("/iniciar-sesion?volver=%2Fadmin%2Fcronologia%2Froma");
  });

  test.describe("con una cuenta normal", () => {
    test.use({ storageState: AUTHOR_STORAGE_STATE });

    test("responde 404", async ({ page }) => {
      expect((await page.goto("/admin/cronologia/roma"))?.status()).toBe(404);
    });
  });

  test.describe("con la administradora", () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    // Añade un hito a Hispania y lo quita al final, para que los demás tests vean la cronología del seed.
    test("añade un hito enlazado a un tema, aparece en la cronología pública y se puede quitar", async ({ page }) => {
      await page.goto("/admin");
      await page.getByRole("link", { name: "Editar la cronología de Hispania" }).click();
      await expect(page).toHaveURL("/admin/cronologia/hispania");

      await page.getByRole("button", { name: "Añadir hito" }).click();
      const count = await page.getByLabel(/^Título del hito \d+$/).count();
      await page.getByLabel(`Título del hito ${count}`).fill("Hito escrito en el E2E");
      await page.getByLabel(`Año del hito ${count}`).fill("145");
      await page.getByLabel(`Descripción del hito ${count}`).fill("Un hito de prueba del editor de la cronología.");
      await page.getByLabel(`Tema enlazado al hito ${count}`).selectOption({ label: "Viriato" });
      await page.getByRole("button", { name: "Guardar" }).click();
      await expect(page.getByText("Guardado ✓")).toBeVisible();

      await page.goto("/hispania/cronologia");
      const milestone = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Hito escrito en el E2E" }) });
      await expect(milestone.getByRole("link", { name: /Viriato/ })).toBeVisible();

      await page.goto("/admin/cronologia/hispania");
      await page
        .getByRole("listitem")
        .filter({ has: page.locator('input[value="Hito escrito en el E2E"]') })
        .getByRole("button", { name: /^Quitar el hito/ })
        .click();
      await page.getByRole("button", { name: "Guardar" }).click();
      await expect(page.getByText("Guardado ✓")).toBeVisible();

      await page.goto("/hispania/cronologia");
      await expect(page.getByRole("heading", { name: "Hito escrito en el E2E" })).toHaveCount(0);
    });
  });
});

test.describe("La portada", () => {
  test("muestra las cifras reales y la Línea de la Antigüedad, cuyos hitos llevan a su tema", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("hitos en la cronología")).toBeVisible();
    const timeline = page.locator("#cronologia");
    await expect(timeline.getByRole("link", { name: "La República romana" })).toBeVisible();

    await timeline.getByRole("link", { name: "753 a.C.: Fundación de Roma" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Rómulo y la fundación de Roma");
  });

  test("cada civilización enlaza a sus temas y a su cronología", async ({ page }) => {
    await page.goto("/");

    await page.locator("#civilizaciones").getByRole("link", { name: "Cronología" }).first().click();
    await expect(page).toHaveURL("/roma/cronologia");
  });
});
