import { toTopicImage } from "@/domain/entities/CatalogImage";
import type { TopicImage } from "@/domain/value-objects/TopicImage";
import { IMAGE_CATALOG } from "@/infrastructure/images/imageCatalog";

// Un tema del seed muestra una imagen del catálogo con el texto del propio catálogo, como si el
// administrador la hubiera elegido en el panel: su archivo, su tamaño y su crédito nunca se copian a mano.
export function catalogImage(id: string): TopicImage {
  const image = IMAGE_CATALOG.find((candidate) => candidate.id === id);
  if (!image) throw new Error(`La imagen ${id} no está en el catálogo`);
  return toTopicImage(image, { alt: image.alt, caption: image.caption });
}
