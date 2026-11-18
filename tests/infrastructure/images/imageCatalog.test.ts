import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { IMAGE_CATALOG } from "@/infrastructure/images/imageCatalog";
import { StaticImageCatalog } from "@/infrastructure/images/StaticImageCatalog";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";

// El tamaño real de un JPEG, leído de su marcador «start of frame». Basta para comprobar el catálogo: un
// ancho o un alto equivocados mostrarían la imagen deformada en la página.
function jpegSize(file: Buffer): { width: number; height: number } {
  let offset = 2; // tras el marcador FFD8 de inicio de imagen
  while (offset < file.length) {
    const marker = file[offset + 1];
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) {
      return { height: file.readUInt16BE(offset + 5), width: file.readUInt16BE(offset + 7) };
    }
    offset += 2 + file.readUInt16BE(offset + 2);
  }
  throw new Error("No es un JPEG válido");
}

describe("Catálogo de imágenes", () => {
  it("los ids no se repiten", () => {
    const ids = IMAGE_CATALOG.map((image) => image.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(IMAGE_CATALOG.map((image) => [image.id, image] as const))(
    "%s: el archivo existe y su tamaño real coincide con el declarado",
    (_id, image) => {
      const path = join("public", image.src);
      expect(existsSync(path), `no existe ${image.src}`).toBe(true);

      expect(jpegSize(readFileSync(path))).toEqual({ width: image.width, height: image.height });
    },
  );

  it.each(HISTORICAL_ERAS)("%s tiene al menos una imagen general, para los temas sin imagen propia", (era) => {
    expect(IMAGE_CATALOG.some((image) => image.era === era && image.kind === "GENERAL")).toBe(true);
  });

  it("las imágenes de los temas de ejemplo están en el catálogo, con su archivo, tamaño y crédito", () => {
    for (const topic of SEED.topics) {
      if (!topic.image) continue;
      const entry = IMAGE_CATALOG.find((image) => image.src === topic.image?.src);

      expect(entry, `${topic.slug}: su imagen no está en el catálogo`).toBeDefined();
      expect([entry?.width, entry?.height, entry?.credit]).toEqual([topic.image.width, topic.image.height, topic.image.credit]);
    }
  });
});

describe("StaticImageCatalog", () => {
  const catalog = new StaticImageCatalog(IMAGE_CATALOG);

  it("encuentra una imagen por su id", async () => {
    expect(await catalog.findById("julio-cesar-busto")).toEqual(IMAGE_CATALOG[0]);
  });

  it("devuelve null para un id que no está en el catálogo", async () => {
    expect(await catalog.findById("../../etc/passwd")).toBeNull();
  });

  it("devuelve copias: modificar el resultado no altera el catálogo", async () => {
    const [first] = await catalog.list();
    first.src = "/images/otra.jpg";

    expect((await catalog.list())[0].src).toBe(IMAGE_CATALOG[0].src);
  });
});
