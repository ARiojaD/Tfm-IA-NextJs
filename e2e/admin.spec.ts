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
      await expect(page).not.toHaveTitle(/Panel/); // ni siquiera en la pestaña del navegador
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
      await expect(page.getByRole("region", { name: "Hispania" }).getByText("Viriato")).toBeVisible();
    });

    // La vida entera de un tema, del formulario vacío a borrarlo. Acaba borrado, así que los demás tests
    // siguen viendo Antigua Grecia como al principio.
    test("crea un tema, lo completa, lo publica, lo despublica y lo borra", async ({ page }) => {
      await page.goto("/admin/temas/nuevo?era=ANCIENT_GREECE");
      await page.getByLabel("Título").fill("Leónidas");
      await page.getByLabel("Resumen").fill("El rey espartano de las Termópilas.");
      await page.getByLabel("Año").first().fill("540");
      await page.getByRole("button", { name: "Crear borrador" }).click();

      await expect(page.getByText("/grecia/personajes/leonidas")).toBeVisible();
      expect((await page.request.get("/grecia/personajes/leonidas")).status()).toBe(404); // un borrador no es público

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

      const timeline = page.getByRole("region", { name: "Cronología" });
      await timeline.getByRole("button", { name: "Añadir evento" }).click();
      await timeline.getByLabel("Título del evento 1").fill("Batalla de las Termópilas");
      await timeline.getByLabel("Año del evento 1").fill("480");
      await timeline.getByLabel("Descripción del evento 1").fill("Trescientos espartanos frente a Jerjes.");
      await timeline.getByRole("button", { name: "Guardar" }).click();
      await expect(timeline.getByText("Guardado ✓")).toBeVisible();

      const quiz = page.getByRole("region", { name: "Quiz" });
      await quiz.getByRole("button", { name: "Añadir pregunta" }).click();
      await quiz.getByLabel("Texto de la pregunta 1").fill("¿Dónde murió Leónidas?");
      await quiz.getByLabel("Opción 1 de la pregunta 1").fill("Maratón");
      await quiz.getByLabel("Opción 2 de la pregunta 1").fill("Termópilas");
      await quiz.getByLabel("Marcar la opción 2 como correcta en la pregunta 1").check();
      await quiz.getByRole("button", { name: "Guardar" }).click();
      await expect(quiz.getByText("Guardado ✓")).toBeVisible();

      await page.getByRole("button", { name: "Publicar" }).click();
      await expect(page.getByText("Visible para todo el mundo.")).toBeVisible();
      // Sin imagen se publica igualmente; al administrador solo se le avisa.
      await expect(page.getByText("Publicado sin imagen. Puedes elegir una más adelante.")).toBeVisible();
      await page.goto("/admin");
      await expect(page.getByRole("region", { name: "Antigua Grecia" }).getByText("Sin imagen")).toBeVisible();
      await page.goto("/grecia");
      // Por su título: la tarjeta de las Termópilas también nombra a Leónidas en su resumen.
      await page.getByRole("link").filter({ has: page.getByRole("heading", { name: "Leónidas", exact: true }) }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Leónidas");
      await expect(page.getByText("Murió en las Termópilas.")).toBeVisible();
      await expect(page.locator("#cronologia").getByText("Batalla de las Termópilas")).toBeVisible();
      // El quiz escrito en el panel se juega en la página pública y lo corrige el servidor.
      await page.locator("#quiz").getByRole("button", { name: "Termópilas" }).click();
      await expect(page.locator("#quiz").getByText("¡Correcto!")).toBeVisible();

      await expect(page.locator("#introduccion figure")).toHaveCount(0); // publicado sin imagen: no se muestra ninguna

      await page.goto("/admin");
      await page.getByRole("link", { name: "Editar Leónidas" }).click();
      // Después, una imagen general de su civilización, del catálogo.
      const imageSection = page.getByRole("region", { name: "Imagen" });
      await imageSection.getByRole("img", { name: /La Acrópolis de Atenas/ }).click();
      await imageSection.getByRole("button", { name: "Guardar" }).click();
      await expect(imageSection.getByText("Guardado ✓")).toBeVisible();
      await page.goto("/grecia/personajes/leonidas");
      await expect(page.locator("#introduccion figure")).toContainText("Foto: Jebulon · CC0");

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

  test.describe("la imagen de un tema", () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    // Julio César empieza con su busto. Sin imagen, su página no muestra nada en su lugar (ni hueco ni un
    // texto de «sin imagen»); al elegirla otra vez del catálogo, vuelve.
    test("se quita y se vuelve a elegir del catálogo", async ({ page }) => {
      const imageSection = page.getByRole("region", { name: "Imagen" });
      await page.goto("/admin/temas/topic-julius-caesar");
      await imageSection.getByText("Sin imagen", { exact: true }).click();
      await imageSection.getByRole("button", { name: "Guardar" }).click();
      await expect(imageSection.getByText("Guardado ✓")).toBeVisible();

      await page.goto("/roma/personajes/julio-cesar");
      await expect(page.locator("#introduccion figure")).toHaveCount(0);
      await expect(page.locator("#introduccion")).not.toContainText("Sin imagen");

      await page.goto("/admin/temas/topic-julius-caesar");
      await imageSection.getByRole("img", { name: /Busto de mármol de Julio César/ }).click();
      await expect(imageSection.getByLabel("Pie de foto")).toHaveValue("Retrato de Túsculo. Museo de Antigüedades de Turín.");
      await imageSection.getByRole("button", { name: "Guardar" }).click();
      await expect(imageSection.getByText("Guardado ✓")).toBeVisible();

      await page.goto("/roma/personajes/julio-cesar");
      await expect(page.locator("#introduccion figure img")).toHaveAttribute("alt", /Busto de mármol de Julio César/);
    });
  });

  test.describe("las propuestas de la IA", () => {
    test.use({ storageState: ADMIN_STORAGE_STATE });

    // La propuesta va debajo de los eventos existentes y no se guarda hasta que el administrador guarda.
    // Por la última fila, no por su número: otro test puede haber aprobado un evento para este tema.
    test("añaden filas a la cronología sin guardar nada", async ({ page }) => {
      const timeline = page.getByRole("region", { name: "Cronología" });
      const lastTitle = timeline.getByLabel(/^Título del evento/).last();
      await page.goto("/admin/temas/topic-julius-caesar");

      await timeline.getByRole("button", { name: "Proponer con IA" }).click();

      await expect(timeline.getByText("Propuestas de la IA añadidas: 1.")).toBeVisible();
      await expect(lastTitle).toHaveValue("Evento propuesto por la IA");
      await expect(timeline.getByLabel(/^Año del evento/).last()).toHaveValue("44");
      await expect(timeline.getByLabel("Título del evento 1", { exact: true })).not.toHaveValue("Evento propuesto por la IA");

      await page.reload();
      await expect(lastTitle).not.toHaveValue("Evento propuesto por la IA");
    });

    test("añaden preguntas al quiz sin guardar nada", async ({ page }) => {
      const quiz = page.getByRole("region", { name: "Quiz" });
      await page.goto("/admin/temas/topic-julius-caesar");

      await quiz.getByRole("button", { name: "Proponer con IA" }).click();

      await expect(quiz.getByLabel("Texto de la pregunta 6")).toHaveValue("Pregunta propuesta por la IA");
      await expect(quiz.getByLabel("Marcar la opción 1 como correcta en la pregunta 6")).toBeChecked();

      await page.reload();
      await expect(quiz.getByLabel("Texto de la pregunta 6")).toHaveCount(0);
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
