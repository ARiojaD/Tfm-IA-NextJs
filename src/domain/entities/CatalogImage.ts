import { z } from "zod";
import { HistoricalEraSchema } from "../value-objects/HistoricalEra";
import { SlugSchema } from "../value-objects/Slug";
import { type TopicImage, TopicImageSchema } from "../value-objects/TopicImage";

// GENERAL: an image that fits any topic of its civilization (the Forum for Rome). SPECIFIC: an image of
// one subject (Caesar's bust), that a topic about it can use.
export const CATALOG_IMAGE_KINDS = ["GENERAL", "SPECIFIC"] as const;

// An image the site owner added to the catalog: a file of the project, with its licence checked. Topics
// can only use catalog images (nothing is uploaded from the web). The admin writes the alt text and the
// caption; `alt` and `caption` here are the suggested ones.
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

// The image a topic stores: file, size and credit always from the catalog (they cannot be forged from a
// form); alt text and caption from the admin.
export function toTopicImage(image: CatalogImage, text: { alt: string; caption: string }): TopicImage {
  return { src: image.src, width: image.width, height: image.height, credit: image.credit, ...text };
}
