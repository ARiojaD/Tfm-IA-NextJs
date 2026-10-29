import { expect, test as setup } from "@playwright/test";
import { AUTHOR, AUTHOR_STORAGE_STATE } from "./testUsers";

// Signs the author in through the real form once, and saves the session cookies for the comment tests.
setup("inicia sesión como la autora de los comentarios", async ({ page }) => {
  await page.goto("/iniciar-sesion");
  await page.getByLabel("Email").fill(AUTHOR.email);
  await page.getByLabel("Contraseña").fill(AUTHOR.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByRole("banner").getByText(`Hola, ${AUTHOR.name}`)).toBeVisible();
  await page.context().storageState({ path: AUTHOR_STORAGE_STATE });
});
