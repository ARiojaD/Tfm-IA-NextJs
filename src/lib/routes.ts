import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { HISTORICAL_ERAS, type HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/domain/value-objects/TopicCategory";

// Spanish URLs: /roma → civilization, /roma/personajes/julio-cesar → topic.

export const ERA_ROUTE_SLUGS: Record<HistoricalEra, string> = {
  ROMAN: "roma",
  ANCIENT_GREECE: "grecia",
  HISPANIA: "hispania",
};

export const CATEGORY_ROUTE_SLUGS: Record<TopicCategory, string> = {
  PEOPLE: "personajes",
  WARS_AND_BATTLES: "guerras-y-batallas",
  PERIODS: "etapas",
  CITIES: "ciudades",
};

export function eraFromRouteSlug(routeSlug: string): HistoricalEra | null {
  return HISTORICAL_ERAS.find((era) => ERA_ROUTE_SLUGS[era] === routeSlug) ?? null;
}

export function categoryFromRouteSlug(routeSlug: string): TopicCategory | null {
  return TOPIC_CATEGORIES.find((category) => CATEGORY_ROUTE_SLUGS[category] === routeSlug) ?? null;
}

export function eraPath(era: HistoricalEra): string {
  return `/${ERA_ROUTE_SLUGS[era]}`;
}

// Categories have no page of their own: they are sections of the civilization page.
export function categoryPath(era: HistoricalEra, category: TopicCategory): string {
  return `${eraPath(era)}#${CATEGORY_ROUTE_SLUGS[category]}`;
}

export function topicPath(topic: Pick<HistoricalTopic, "era" | "category" | "slug">): string {
  return `${eraPath(topic.era)}/${CATEGORY_ROUTE_SLUGS[topic.category]}/${topic.slug}`;
}
