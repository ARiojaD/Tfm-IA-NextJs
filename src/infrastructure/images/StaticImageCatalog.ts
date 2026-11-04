import type { ImageCatalog } from "@/application/ports/ImageCatalog";
import type { CatalogImage } from "@/domain/entities/CatalogImage";

// The catalog as a list in the code (src/infrastructure/images/imageCatalog.ts): adding an image is a
// commit, reviewed like any other change.
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
