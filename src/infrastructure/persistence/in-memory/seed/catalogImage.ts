import { toTopicImage } from "@/domain/entities/CatalogImage";
import type { TopicImage } from "@/domain/value-objects/TopicImage";
import { IMAGE_CATALOG } from "@/infrastructure/images/imageCatalog";

// A seed topic shows a catalog image with the catalog's own text, as if the admin had chosen it in the
// panel: its file, size and credit are never copied by hand.
export function catalogImage(id: string): TopicImage {
  const image = IMAGE_CATALOG.find((candidate) => candidate.id === id);
  if (!image) throw new Error(`La imagen ${id} no está en el catálogo`);
  return toTopicImage(image, { alt: image.alt, caption: image.caption });
}
