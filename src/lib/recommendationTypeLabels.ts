import type { RecommendationType } from "@/domain/value-objects/RecommendationType";

export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, string> = {
  BOOK: "Libros",
  FILM: "Películas",
  SERIES: "Series",
};

// For one item ("Libro: César, de Adrian Goldsworthy").
export const RECOMMENDATION_TYPE_SINGULAR_LABELS: Record<RecommendationType, string> = {
  BOOK: "Libro",
  FILM: "Película",
  SERIES: "Serie",
};
