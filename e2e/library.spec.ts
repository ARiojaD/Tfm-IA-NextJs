import { expect, test } from "@playwright/test";
import { AUTHOR_STORAGE_STATE } from "./testUsers";

const ALESIA_PATH = "/roma/guerras-y-batallas/asedio-de-alesia";

test.describe("Mi biblioteca sin sesión", () => {
  test("los botones se ven igual y llevan a iniciar sesión, volviendo a la página", async ({ page }) => {
    await page.goto("/roma");

    await page.getByRole("link", { name: "Seguir Roma" }).click();

    await expect(page).toHaveURL("/iniciar-sesion?volver=%2Froma");
  });

  test("la página de la biblioteca pide iniciar sesión", async ({ page }) => {
    await page.goto("/mi-biblioteca");

    await expect(page).toHaveURL("/iniciar-sesion?volver=%2Fmi-biblioteca");
  });
});

test.describe("Mi biblioteca con sesión", () => {
  test.use({ storageState: AUTHOR_STORAGE_STATE });

  // Una historia de principio a fin: la biblioteca es de la cuenta de prueba compartida, así que se deja vacía otra vez.
  test("seguir Roma y guardar un tema los lleva a la biblioteca, y se pueden quitar", async ({ page }) => {
    await page.goto("/roma");
    await page.getByRole("button", { name: "Seguir Roma" }).click();
    await expect(page.getByRole("button", { name: "✓ Siguiendo Roma" })).toBeVisible();

    await page.goto(ALESIA_PATH);
    await page.getByRole("button", { name: "☆ Guardar" }).click();
    await expect(page.getByRole("button", { name: "★ Guardado" })).toBeVisible();

    await page.getByRole("banner").getByRole("link", { name: "Mi biblioteca" }).click();
    await expect(page).toHaveURL("/mi-biblioteca");
    const followed = page.getByRole("region", { name: "Civilizaciones que sigues" });
    const saved = page.getByRole("region", { name: "Temas guardados" });
    // Seguir Roma trae todos los temas romanos, no solo el guardado.
    await expect(followed.getByRole("link", { name: /Julio César/ })).toBeVisible();
    await expect(followed.getByRole("link", { name: /Asedio de Alesia/ })).toBeVisible();
    await expect(saved.getByRole("link", { name: /Asedio de Alesia/ })).toBeVisible();

    await saved.getByRole("button", { name: "★ Guardado" }).click();
    await expect(saved).toBeHidden();
    await followed.getByRole("button", { name: "✓ Siguiendo Roma" }).click();
    await expect(page.getByText("Tu biblioteca está vacía.")).toBeVisible();
  });
});
