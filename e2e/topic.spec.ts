import { expect, test } from "@playwright/test";

const CAESAR_PATH = "/roma/personajes/julio-cesar";

test.describe("Página de un tema", () => {
  test("se llega a Julio César desde la portada, pasando por Roma", async ({ page }) => {
    await page.goto("/");

    // Anchored: the Hispania card also mentions Rome in its description.
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

test.describe("Comentarios", () => {
  test("un comentario publicado aparece en la conversación", async ({ page }) => {
    const message = `Comentario de prueba E2E ${Date.now()}`;
    await page.goto(CAESAR_PATH);
    const community = page.locator("#comunidad");

    await community.getByLabel("Tu nombre").fill("Playwright");
    await community.getByLabel("Comentario").fill(message);
    await community.getByRole("button", { name: "Publicar comentario" }).click();

    await expect(community.getByText("¡Comentario publicado!")).toBeVisible();
    await expect(community.getByText(message)).toBeVisible();
  });

  test("un comentario vacío muestra el error sin publicarse", async ({ page }) => {
    await page.goto(CAESAR_PATH);
    const community = page.locator("#comunidad");

    await community.getByLabel("Tu nombre").fill("Playwright");
    await community.getByRole("button", { name: "Publicar comentario" }).click();

    await expect(community.getByLabel("Comentario")).toHaveAttribute("aria-invalid", "true");
    await expect(community.getByText("¡Comentario publicado!")).toBeHidden();
  });
});
