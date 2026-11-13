import { expect, test } from "@playwright/test";
import { AUTHOR_STORAGE_STATE } from "./testUsers";

test.describe("Preguntar a la enciclopedia", () => {
  test("sin sesión pide iniciar sesión y vuelve a la página", async ({ page }) => {
    await page.goto("/preguntar");

    await page.getByRole("link", { name: "Inicia sesión para preguntar" }).click();

    await expect(page).toHaveURL("/iniciar-sesion?volver=%2Fpreguntar");
  });

  test("la pregunta escrita en la portada se conserva al pasar por iniciar sesión", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("searchbox", { name: "Tu pregunta a la enciclopedia" }).fill("¿Quién fundó Emerita Augusta?");
    await page.getByRole("button", { name: "Preguntar" }).click();

    await expect(page).toHaveURL(/\/preguntar\?q=/);
    await expect(page.getByRole("link", { name: "Inicia sesión para preguntar" })).toHaveAttribute(
      "href",
      `/iniciar-sesion?volver=${encodeURIComponent(`/preguntar?q=${encodeURIComponent("¿Quién fundó Emerita Augusta?")}`)}`,
    );
  });

  test.describe("con sesión", () => {
    test.use({ storageState: AUTHOR_STORAGE_STATE });

    test("la pregunta que llega desde la portada aparece escrita, sin enviarse sola", async ({ page }) => {
      await page.goto(`/preguntar?q=${encodeURIComponent("¿Quién fundó Emerita Augusta?")}`);

      await expect(page.getByLabel("Tu pregunta")).toHaveValue("¿Quién fundó Emerita Augusta?");
      await expect(page.getByRole("region", { name: "Respuesta" })).toBeEmpty();
    });

    test("responde citando la fuente, y la cita lleva al evento exacto de la cronología", async ({ page }) => {
      await page.goto("/preguntar");

      await page.getByLabel("Tu pregunta").fill("¿Cuándo cruzó César el Rubicón?");
      await page.getByRole("button", { name: "Preguntar" }).click();

      const answer = page.getByRole("region", { name: "Respuesta" });
      await expect(answer.getByText("Respuesta de prueba del modelo")).toBeVisible();
      await expect(answer.getByRole("list", { name: "Fuentes" })).toContainText("Cruce del Rubicón");
      // The question stays in the box after the answer arrives.
      await expect(page.getByLabel("Tu pregunta")).toHaveValue("¿Cuándo cruzó César el Rubicón?");

      await answer.getByRole("link", { name: "Fuente 1" }).click();

      await expect(page).toHaveURL(/\/roma\/personajes\/julio-cesar#evento-/);
      await expect(page.locator(":target")).toContainText("Cruce del Rubicón");
    });

    test("si no hay información lo dice y ofrece proponer un tema nuevo", async ({ page }) => {
      await page.goto("/preguntar");

      await page.getByLabel("Tu pregunta").fill("¿Qué es la fotosíntesis?");
      await page.getByRole("button", { name: "Preguntar" }).click();

      await expect(page.getByText("No hay información sobre esto en MemnonHistory todavía.")).toBeVisible();
      await page.getByRole("link", { name: "Proponer un tema nuevo" }).click();

      await expect(page).toHaveURL("/mi-biblioteca/propuestas?tipo=tema-nuevo");
      await expect(page.getByLabel("¿Qué quieres proponer?")).toHaveValue("NEW_TOPIC");
    });

    test("una pregunta vacía muestra el error sin buscar", async ({ page }) => {
      await page.goto("/preguntar");

      await page.getByRole("button", { name: "Preguntar" }).click();

      await expect(page.getByText("Escribe tu pregunta", { exact: true })).toBeVisible();
    });
  });
});
