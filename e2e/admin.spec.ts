import { expect, test } from "@playwright/test";
import { ADMIN_STORAGE_STATE, AUTHOR_STORAGE_STATE } from "./testUsers";

test.describe("Panel de administración", () => {
  test("sin sesión, pide iniciar sesión y vuelve al panel", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL("/iniciar-sesion?volver=%2Fadmin");
  });

  test.describe("con una cuenta normal", () => {
    test.use({ storageState: AUTHOR_STORAGE_STATE });

    test("responde 404 sin delatar el panel, y la cabecera no muestra su enlace", async ({ page }) => {
      const response = await page.goto("/admin");

      expect(response?.status()).toBe(404);
      await expect(page).not.toHaveTitle(/Panel/); // not even in the browser tab
      await expect(page.getByRole("banner").getByRole("link", { name: "Panel" })).toHaveCount(0);
    });
  });

  test.describe("con la administradora", () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    test("entra desde la cabecera y ve los temas de cada civilización", async ({ page }) => {
      await page.goto("/");

      await page.getByRole("banner").getByRole("link", { name: "Panel" }).click();

      await expect(page).toHaveURL("/admin");
      const rome = page.getByRole("region", { name: "Roma" });
      await expect(rome.getByText("Julio César")).toBeVisible();
      await expect(rome.getByText("Asedio de Alesia")).toBeVisible();
      await expect(page.getByRole("region", { name: "Hispania" }).getByText("Todavía no hay temas.")).toBeVisible();
    });
  });
});
