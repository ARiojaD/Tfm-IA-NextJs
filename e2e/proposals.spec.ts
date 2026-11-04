import { type Browser, expect, type Page, test } from "@playwright/test";
import { ADMIN_STORAGE_STATE, AUTHOR_STORAGE_STATE } from "./testUsers";

const CAESAR_PATH = "/roma/personajes/julio-cesar";

async function pageAs(browser: Browser, storageState: string): Promise<Page> {
  return (await browser.newContext({ storageState })).newPage();
}

test.describe("Propuestas de los usuarios", () => {
  test("sin sesión, «Proponer una mejora» pide iniciar sesión y vuelve con el tema elegido", async ({ page }) => {
    await page.goto(CAESAR_PATH);

    await page.getByRole("link", { name: "Proponer una mejora" }).click();

    await expect(page).toHaveURL("/iniciar-sesion?volver=%2Fmi-biblioteca%2Fpropuestas%3Ftema%3Djulio-cesar");
  });

  // The whole loop with two accounts: the author proposes, the admin approves, the site changes.
  test("un evento propuesto y aprobado aparece en la cronología del tema", async ({ browser }) => {
    const title = `Batalla de Munda ${Date.now()}`;
    const author = await pageAs(browser, AUTHOR_STORAGE_STATE);
    await author.goto(CAESAR_PATH);
    await author.getByRole("link", { name: "Proponer una mejora" }).click();
    await author.getByLabel("¿Qué quieres proponer?").selectOption("EVENT");
    await author.getByLabel("Título del evento").fill(title);
    await author.getByLabel("Año").fill("45");
    await author.getByLabel("Qué pasó").fill("Última victoria de César en Hispania.");
    await author.getByLabel("Fuente").fill("Plutarco, Vidas paralelas");
    await author.getByRole("button", { name: "Enviar propuesta" }).click();
    await expect(author.getByText("¡Gracias! Un administrador la revisará.")).toBeVisible();
    const mine = author.getByRole("listitem").filter({ hasText: title });
    await expect(mine).toContainText("Pendiente");

    const admin = await pageAs(browser, ADMIN_STORAGE_STATE);
    await admin.goto("/admin/propuestas");
    const card = admin.getByRole("listitem").filter({ hasText: title });
    await expect(card).toContainText("Propuesta por Autora E2E");
    await card.getByRole("button", { name: "Aprobar y añadir a la cronología" }).click();
    await expect(card).toHaveCount(0);

    await author.goto(CAESAR_PATH);
    await expect(author.locator("#cronologia").getByText(title)).toBeVisible();
    await author.goto("/mi-biblioteca/propuestas");
    await expect(author.getByRole("listitem").filter({ hasText: title })).toContainText("Aprobada");
  });

  test("un tema nuevo rechazado muestra el motivo a quien lo propuso", async ({ browser }) => {
    const title = `Sertorio ${Date.now()}`;
    const author = await pageAs(browser, AUTHOR_STORAGE_STATE);
    await author.goto("/mi-biblioteca/propuestas");
    await author.getByLabel("¿Qué quieres proponer?").selectOption("NEW_TOPIC");
    await author.getByLabel("Título del tema").fill(title);
    await author.getByLabel("Resumen").fill("El general romano que resistió en Hispania.");
    await author.getByLabel("Año").first().fill("123");
    await author.getByLabel("Descripción").fill("Quinto Sertorio.");
    await author.getByLabel("Fuente").fill("Plutarco");
    await author.getByRole("button", { name: "Enviar propuesta" }).click();
    await expect(author.getByText("¡Gracias! Un administrador la revisará.")).toBeVisible();

    const admin = await pageAs(browser, ADMIN_STORAGE_STATE);
    await admin.goto("/admin/propuestas");
    const card = admin.getByRole("listitem").filter({ hasText: title });
    await card.getByRole("button", { name: "Rechazar" }).click();
    await expect(card.getByText("Explica el motivo del rechazo")).toBeVisible();
    await card.getByLabel("Respuesta para quien la propuso").fill("Ya está previsto en Hispania.");
    await card.getByRole("button", { name: "Rechazar" }).click();
    await expect(card).toHaveCount(0);

    await author.goto("/mi-biblioteca/propuestas");
    const mine = author.getByRole("listitem").filter({ hasText: title });
    await expect(mine).toContainText("Rechazada");
    await expect(mine).toContainText("Respuesta: Ya está previsto en Hispania.");
  });

  test("una cuenta normal no puede entrar en la bandeja de propuestas", async ({ browser }) => {
    const author = await pageAs(browser, AUTHOR_STORAGE_STATE);

    expect((await author.goto("/admin/propuestas"))?.status()).toBe(404);
  });
});
