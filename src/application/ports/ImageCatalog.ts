import type { CatalogImage } from "@/domain/entities/CatalogImage";

// The images topics may use, chosen by the site owner (files of the project with their licence checked).
// The admin panel picks from here; nothing is uploaded from the web.
export interface ImageCatalog {
  list(): Promise<CatalogImage[]>;
  // Unknown ids → null: an image that is not in the catalog cannot be used.
  findById(id: string): Promise<CatalogImage | null>;
}
