import type { TopicCategory } from "@/domain/value-objects/TopicCategory";

// Los nombres de las categorías tal como los lee el visitante.
export const CATEGORY_LABELS: Record<TopicCategory, string> = {
  PEOPLE: "Personajes",
  WARS_AND_BATTLES: "Guerras y batallas",
  PERIODS: "Etapas",
  CITIES: "Ciudades",
};
