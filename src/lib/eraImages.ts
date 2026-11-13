import type { HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// La imagen que representa a cada civilización en la portada. Son imágenes generales del catálogo
// (`infrastructure/images/imageCatalog.ts`), con su licencia ya revisada; aquí solo se elige cuál va con
// cada civilización. El Foro se reserva para el fondo de la cabecera.
export const ERA_IMAGES: Record<HistoricalEra, { src: string; credit: string }> = {
  ROMAN: { src: "/images/catalog/roma-coliseo.jpg", credit: "El Coliseo de Roma" },
  ANCIENT_GREECE: { src: "/images/catalog/grecia-partenon.jpg", credit: "El Partenón de Atenas" },
  HISPANIA: { src: "/images/catalog/hispania-teatro-merida.jpg", credit: "El teatro romano de Mérida" },
};

export const HERO_IMAGE = "/images/catalog/roma-foro.jpg";
