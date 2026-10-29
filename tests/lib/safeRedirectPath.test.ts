import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safeRedirectPath";

describe("safeRedirectPath (prevención de redirecciones abiertas)", () => {
  it.each(["/", "/roma", "/roma/personajes/julio-cesar", "/roma/guerras-y-batallas/asedio-de-alesia#comunidad"])(
    "acepta una ruta interna: %s",
    (path) => {
      expect(safeRedirectPath(path)).toBe(path);
    },
  );

  it.each([
    "https://web-falsa.com",
    "//web-falsa.com",
    "/\\web-falsa.com",
    "\\\\web-falsa.com",
    "javascript:alert(1)",
    "roma",
    "",
    " /roma",
    "/roma\nSet-Cookie: x=1",
  ])("rechaza %j y vuelve a la portada", (path) => {
    expect(safeRedirectPath(path)).toBe("/");
  });

  it.each([null, undefined, 42, ["/roma"]])("rechaza un valor que no es texto: %j", (value) => {
    expect(safeRedirectPath(value)).toBe("/");
  });

  it("rechaza rutas desmesuradamente largas", () => {
    expect(safeRedirectPath(`/${"a".repeat(600)}`)).toBe("/");
  });

  it("permite indicar otra ruta por defecto", () => {
    expect(safeRedirectPath("https://web-falsa.com", "/roma")).toBe("/roma");
  });
});
