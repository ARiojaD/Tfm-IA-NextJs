import type { ImageCatalog } from "@/application/ports/ImageCatalog";
import type { CatalogImage } from "@/domain/entities/CatalogImage";

// El catálogo como una lista en el código (`src/infrastructure/images/imageCatalog.ts`): añadir una imagen
// es un commit, revisado como cualquier otro cambio.
export class StaticImageCatalog implements ImageCatalog {
  private readonly images: CatalogImage[];

  constructor(images: CatalogImage[]) {
    this.images = structuredClone(images);
  }

  list(): Promise<CatalogImage[]> {
    return Promise.resolve(structuredClone(this.images));
  }

  findById(id: string): Promise<CatalogImage | null> {
    const image = this.images.find((candidate) => candidate.id === id);
    return Promise.resolve(image ? structuredClone(image) : null);
  }
}
