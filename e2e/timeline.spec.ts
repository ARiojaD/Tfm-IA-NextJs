import { expect, test } from "@playwright/test";

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
