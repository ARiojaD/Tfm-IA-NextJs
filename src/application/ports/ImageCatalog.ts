import type { CatalogImage } from "@/domain/entities/CatalogImage";

// Las imágenes que pueden usar los temas, elegidas por el responsable del sitio (archivos del proyecto con
// la licencia comprobada). El panel de administración elige de aquí; desde la web no se sube nada.
export interface ImageCatalog {
  list(): Promise<CatalogImage[]>;
  // Un id desconocido devuelve null: una imagen que no está en el catálogo no se puede usar.
  findById(id: string): Promise<CatalogImage | null>;
}
