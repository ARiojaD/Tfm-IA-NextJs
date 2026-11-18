import { expect, test } from "@playwright/test";
import { READER } from "./testUsers";

const CAESAR_PATH = "/roma/personajes/julio-cesar";

test.describe("Registro", () => {
  test("crea la cuenta, saluda con el nombre visible y permite cerrar la sesión", async ({ page }) => {
    const email = `registro.${Date.now()}@example.com`;
    await page.goto("/registro");

    await page.getByLabel("Nombre visible").fill("Nueva Cuenta");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Contraseña").fill("una frase larga para la cuenta nueva");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    const header = page.getByRole("banner");
    await expect(header.getByText("Hola, Nueva Cuenta")).toBeVisible();
    await expect(header).not.toContainText(email); // el correo nunca se muestra

    await header.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(header.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();
  });

  test("una contraseña corta muestra la regla y conserva el nombre y el email", async ({ page }) => {
    await page.goto("/registro");

    await page.getByLabel("Nombre visible").fill("Nueva Cuenta");
    await page.getByLabel("Email").fill("corta@example.com");
    await page.getByLabel("Contraseña").fill("corta");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.getByText("La contraseña debe tener al menos 12 caracteres")).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("corta@example.com");
    await expect(page.getByLabel("Contraseña")).toHaveValue("");
  });
});

test.describe("Inicio de sesión", () => {
  test("con una contraseña incorrecta da un error genérico", async ({ page }) => {
    await page.goto("/iniciar-sesion");

    await page.getByLabel("Email").fill(READER.email);
    await page.getByLabel("Contraseña").fill("no es la contraseña del lector");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // Dentro de <main>: Next.js añade su propio elemento role="alert" (el anunciador de rutas para lectores de pantalla).
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Email o contraseña incorrectos");
  });

  test("desde un tema, vuelve a la conversación de ese tema", async ({ page }) => {
    await page.goto(CAESAR_PATH);
    await page.getByRole("link", { name: "Inicia sesión para comentar" }).click();

    await page.getByLabel("Email").fill(READER.email);
    await page.getByLabel("Contraseña").fill(READER.password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL(`${CAESAR_PATH}#comunidad`);
    await expect(page.locator("#comunidad").getByText(`Comentas como ${READER.name}`)).toBeVisible();
  });

  test("no redirige fuera de la web aunque la URL lo pida (redirección abierta)", async ({ page }) => {
    await page.goto("/iniciar-sesion?volver=https://web-falsa.example.com");

    await page.getByLabel("Email").fill(READER.email);
    await page.getByLabel("Contraseña").fill(READER.password);
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page).toHaveURL("/");
  });
});
