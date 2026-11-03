import { expect, type Page, test as setup } from "@playwright/test";
import { ADMIN, ADMIN_STORAGE_STATE, AUTHOR, AUTHOR_STORAGE_STATE } from "./testUsers";

// Signs each account in through the real form once, and saves its session cookies for the tests.
async function signInAndSave(page: Page, account: typeof AUTHOR, path: string) {
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Contraseña").fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByRole("banner").getByText(`Hola, ${account.name}`)).toBeVisible();
  await page.context().storageState({ path });
}

setup("inicia sesión como la autora de los comentarios", async ({ page }) => {
  await signInAndSave(page, AUTHOR, AUTHOR_STORAGE_STATE);
});

setup("inicia sesión como la administradora", async ({ page }) => {
  await signInAndSave(page, ADMIN, ADMIN_STORAGE_STATE);
});
