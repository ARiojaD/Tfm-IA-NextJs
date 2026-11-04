import { describe, expect, it } from "vitest";
import { CatalogImageSchema, toTopicImage } from "@/domain/entities/CatalogImage";

const forum = {
  id: "roma-foro",
  src: "/images/catalog/roma-foro.jpg",
  width: 1200,
  height: 800,
  credit: "Dominio público",
  era: "ROMAN",
  kind: "GENERAL",
  alt: "Ruinas del Foro romano",
  caption: "El Foro romano, centro de la vida pública de Roma.",
};

describe("CatalogImageSchema", () => {
  it("acepta una imagen del catálogo válida", () => {
    expect(CatalogImageSchema.parse(forum)).toEqual(forum);
  });

  it.each([
    ["un archivo externo", { src: "https://example.com/foro.jpg" }],
    ["un SVG (puede llevar scripts)", { src: "/images/catalog/foro.svg" }],
    ["una ruta con ..", { src: "/images/../secretos.jpg" }],
    ["un id que no sirve para una URL", { id: "Roma Foro" }],
    ["un tipo desconocido", { kind: "BANNER" }],
    ["una civilización desconocida", { era: "EGYPT" }],
    ["un crédito vacío (las licencias libres exigen atribución)", { credit: " " }],
    ["un tamaño no positivo", { width: 0 }],
  ])("rechaza %s", (_case, overrides) => {
    expect(CatalogImageSchema.safeParse({ ...forum, ...overrides }).success).toBe(false);
  });
});

describe("toTopicImage", () => {
  it("toma el archivo, el tamaño y el crédito del catálogo, y el texto alternativo y el pie del administrador", () => {
    const image = toTopicImage(CatalogImageSchema.parse(forum), { alt: "El Foro hoy", caption: "Vista del Foro." });

    expect(image).toEqual({
      src: "/images/catalog/roma-foro.jpg",
      width: 1200,
      height: 800,
      credit: "Dominio público",
      alt: "El Foro hoy",
      caption: "Vista del Foro.",
    });
  });
});
