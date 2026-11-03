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

    // The whole life of a topic, from the empty form to deleting it. It ends deleted, so other tests
    // still see Antigua Grecia as it started.
    test("crea un tema, lo completa, lo publica, lo despublica y lo borra", async ({ page }) => {
      await page.goto("/admin/temas/nuevo?era=ANCIENT_GREECE");
      await page.getByLabel("Título").fill("Leónidas");
      await page.getByLabel("Resumen").fill("El rey espartano de las Termópilas.");
      await page.getByLabel("Año").first().fill("540");
      await page.getByRole("button", { name: "Crear borrador" }).click();

      await expect(page.getByText("/grecia/personajes/leonidas")).toBeVisible();
      expect((await page.request.get("/grecia/personajes/leonidas")).status()).toBe(404); // a draft is not public

      await page.getByRole("button", { name: "Publicar" }).click();
      await expect(page.getByText("Escribe la introducción antes de publicar")).toBeVisible();

      const introduction = page.getByRole("region", { name: "Introducción" });
      await introduction.getByLabel("Introducción").fill("Rey de Esparta.\n\nMurió en las Termópilas.");
      await introduction.getByRole("button", { name: "Guardar" }).click();
      await expect(introduction.getByText("Guardado ✓")).toBeVisible();

      const keyFacts = page.getByRole("region", { name: "Datos clave" });
      await keyFacts.getByLabel("Etiqueta del dato 1").fill("Muerte");
      await keyFacts.getByLabel("Valor del dato 1").fill("480 a.C., Termópilas");
      await keyFacts.getByRole("button", { name: "Guardar" }).click();
      await expect(keyFacts.getByText("Guardado ✓")).toBeVisible();

      await page.getByRole("button", { name: "Publicar" }).click();
      await expect(page.getByText("Visible para todo el mundo.")).toBeVisible();
      await page.goto("/grecia");
      await page.getByRole("link", { name: /Leónidas/ }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Leónidas");
      await expect(page.getByText("Murió en las Termópilas.")).toBeVisible();

      await page.goBack();
      await page.goto("/admin");
      await page.getByRole("link", { name: "Editar Leónidas" }).click();
      await page.getByRole("button", { name: "Despublicar" }).click();
      await expect(page.getByText("Solo lo ven los administradores.")).toBeVisible();
      expect((await page.request.get("/grecia/personajes/leonidas")).status()).toBe(404);

      await page.getByRole("button", { name: "Borrar borrador" }).click();
      await page.getByRole("button", { name: "Sí, borrar" }).click();
      await expect(page).toHaveURL("/admin");
      await expect(page.getByText("Leónidas")).toHaveCount(0);
    });
  });

  test.describe("con una cuenta normal, las páginas del editor", () => {
    test.use({ storageState: AUTHOR_STORAGE_STATE });

    test("también responden 404", async ({ page }) => {
      for (const path of ["/admin/temas/nuevo", "/admin/temas/topic-julius-caesar", "/admin/temas/topic-julius-caesar/vista-previa"]) {
        expect((await page.goto(path))?.status(), path).toBe(404);
      }
    });
  });
});
