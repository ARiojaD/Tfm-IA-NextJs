import { expect, test } from "@playwright/test";
import { AUTHOR, AUTHOR_STORAGE_STATE } from "./testUsers";

const CAESAR_PATH = "/roma/personajes/julio-cesar";

test.describe("Página de un tema", () => {
  test("se llega a Julio César desde la portada, pasando por Roma", async ({ page }) => {
    await page.goto("/");

    // Anclado: la tarjeta de Hispania también nombra Roma en su descripción.
    await page.locator("#civilizaciones").getByRole("link", { name: /^Roma/ }).click();
    await expect(page).toHaveURL("/roma");

    await page.getByRole("link", { name: /Julio César/ }).click();
    await expect(page).toHaveURL(CAESAR_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Julio César");
    await expect(page.getByText("Datos clave")).toBeVisible();
  });

  test("una URL de tema inexistente responde 404", async ({ page }) => {
    const response = await page.goto("/roma/personajes/tema-que-no-existe");

    expect(response?.status()).toBe(404);
  });
});

test.describe("Quiz", () => {
  test("no envía las soluciones al navegador", async ({ page }) => {
    await page.goto(CAESAR_PATH);

    const html = await page.content();
    expect(html).not.toContain("correctOptionIndex");
  });

  test("el servidor corrige una respuesta acertada y otra fallada", async ({ page }) => {
    await page.goto(CAESAR_PATH);
    const quiz = page.locator("#quiz");

    await quiz.getByRole("button", { name: "Rubicón" }).click();
    await expect(quiz.getByText("¡Correcto!")).toBeVisible();

    await quiz.getByRole("button", { name: "Bruto y Casio" }).click();
    await expect(quiz.getByText("No es correcto.")).toBeVisible();

    await expect(quiz.getByText("Respondidas 2 de 5 · Aciertos 1")).toBeVisible();
  });
});

test.describe("Comentarios sin sesión", () => {
  test("no hay formulario: se invita a iniciar sesión", async ({ page }) => {
    await page.goto(CAESAR_PATH);
    const community = page.locator("#comunidad");

    await expect(community.getByRole("link", { name: "Inicia sesión para comentar" })).toBeVisible();
    await expect(community.getByRole("button", { name: "Publicar comentario" })).toHaveCount(0);
  });
});

test.describe("Comentarios con sesión", () => {
  test.use({ storageState: AUTHOR_STORAGE_STATE });

  test("un comentario publicado aparece firmado con el nombre de la cuenta", async ({ page }) => {
    const message = `Comentario de prueba E2E ${Date.now()}`;
    await page.goto(CAESAR_PATH);
    const community = page.locator("#comunidad");

    await expect(community.getByText(`Comentas como ${AUTHOR.name}`)).toBeVisible();
    await expect(community.getByLabel("Tu nombre")).toHaveCount(0); // el autor no se puede elegir
    await community.getByLabel("Comentario").fill(message);
    await community.getByRole("button", { name: "Publicar comentario" }).click();

    await expect(community.getByText("¡Comentario publicado!")).toBeVisible();
    const published = community.getByRole("listitem").filter({ hasText: message });
    await expect(published).toContainText(AUTHOR.name);
  });

  test("un comentario vacío muestra el error sin publicarse", async ({ page }) => {
    await page.goto(CAESAR_PATH);
    const community = page.locator("#comunidad");

    await community.getByRole("button", { name: "Publicar comentario" }).click();

    await expect(community.getByLabel("Comentario")).toHaveAttribute("aria-invalid", "true");
    await expect(community.getByText("¡Comentario publicado!")).toBeHidden();
  });
});
