import type { RecommendationType } from "@/domain/value-objects/RecommendationType";

// Los tipos de recomendación en plural, como títulos de grupo en la página de un tema.
export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, string> = {
  BOOK: "Libros",
  FILM: "Películas",
  SERIES: "Series",
};

// Para un solo elemento ("Libro: César, de Adrian Goldsworthy").
export const RECOMMENDATION_TYPE_SINGULAR_LABELS: Record<RecommendationType, string> = {
  BOOK: "Libro",
  FILM: "Película",
  SERIES: "Serie",
};
