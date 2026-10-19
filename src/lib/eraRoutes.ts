import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { HISTORICAL_ERAS, type HistoricalEra } from "@/domain/value-objects/HistoricalEra";

// Spanish URL segment for each era: /roma/julio-cesar, /grecia/…, /hispania/…
export const ERA_ROUTE_SLUGS: Record<HistoricalEra, string> = {
  ROMAN: "roma",
  ANCIENT_GREECE: "grecia",
  HISPANIA: "hispania",
};

export function eraFromRouteSlug(routeSlug: string): HistoricalEra | null {
  return HISTORICAL_ERAS.find((era) => ERA_ROUTE_SLUGS[era] === routeSlug) ?? null;
}

export function topicPath(topic: Pick<HistoricalTopic, "era" | "slug">): string {
  return `/${ERA_ROUTE_SLUGS[topic.era]}/${topic.slug}`;
}
