import { expect, type Page, test } from "@playwright/test";

const CAESAR_PATH = "/roma/personajes/julio-cesar";

// Los mensajes con los que el navegador avisa de que la política de seguridad bloqueó algo.
function collectCspViolations(page: Page): string[] {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to (execute|load|apply)/i.test(message.text())) violations.push(message.text());
  });
  return violations;
}

test.describe("Cabeceras de seguridad (OWASP A05)", () => {
  test("cada página lleva su CSP con un nonce nuevo y las cabeceras fijas", async ({ page }) => {
    const first = await page.goto("/");
    const second = await page.goto("/");
    const firstPolicy = first?.headers()["content-security-policy"] ?? "";
    const secondPolicy = second?.headers()["content-security-policy"] ?? "";

    expect(firstPolicy).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(firstPolicy).toContain("frame-ancestors 'none'");
    expect(firstPolicy).not.toBe(secondPolicy);
    expect(first?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(first?.headers()["x-frame-options"]).toBe("DENY");
    expect(first?.headers()["x-powered-by"]).toBeUndefined();
  });

  test("la CSP no bloquea nada de la web: el tema se aplica y el quiz se juega", async ({ page }) => {
    const violations = collectCspViolations(page);
    await page.addInitScript(() => localStorage.setItem("memnon-theme", "light"));

    await page.goto(CAESAR_PATH);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    const quiz = page.locator("#quiz");
    await quiz.getByRole("button", { name: "Rubicón" }).click();
    await expect(quiz.getByText("¡Correcto!")).toBeVisible();

    expect(violations).toEqual([]);
  });
});
