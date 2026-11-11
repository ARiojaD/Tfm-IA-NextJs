import { z } from "zod";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";
import { SlugSchema } from "../value-objects/Slug";
import { type TopicImage, TopicImageSchema } from "../value-objects/TopicImage";

// GENERAL: una imagen que vale para cualquier tema de su civilización (el Foro para Roma). SPECIFIC: la
// imagen de un tema concreto (el busto de César), que puede usar un tema sobre él.
export const CATALOG_IMAGE_KINDS = ["GENERAL", "SPECIFIC"] as const;

// Una imagen que el responsable del sitio añadió al catálogo: un archivo del proyecto con la licencia
// comprobada. Los temas solo pueden usar imágenes del catálogo (desde la web no se sube nada). El
// administrador escribe el texto alternativo y el pie; `alt` y `caption` son aquí los sugeridos.
export const CatalogImageSchema = z.strictObject({
  id: SlugSchema,
  src: TopicImageSchema.shape.src,
  width: TopicImageSchema.shape.width,
  height: TopicImageSchema.shape.height,
  credit: TopicImageSchema.shape.credit,
  era: HistoricalEraSchema,
  kind: z.enum(CATALOG_IMAGE_KINDS),
  alt: TopicImageSchema.shape.alt,
  caption: TopicImageSchema.shape.caption,
});

export type CatalogImage = z.infer<typeof CatalogImageSchema>;

// La imagen que guarda un tema: el archivo, el tamaño y el crédito salen siempre del catálogo (no se pueden
// falsear desde un formulario); el texto alternativo y el pie, del administrador.
export function toTopicImage(image: CatalogImage, text: { alt: string; caption: string }): TopicImage {
  return { src: image.src, width: image.width, height: image.height, credit: image.credit, ...text };
}
