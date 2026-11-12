import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import type { KnowledgeChunk } from "@/domain/entities/KnowledgeChunk";
import { HISTORICAL_ERAS, type HistoricalEra } from "@/domain/value-objects/HistoricalEra";
import { TOPIC_CATEGORIES, type TopicCategory } from "@/domain/value-objects/TopicCategory";

// URL en castellano: /roma → civilización, /roma/personajes/julio-cesar → tema. Los valores del dominio
// siguen en inglés; la traducción de ida y vuelta está aquí.

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

// Las categorías no tienen página propia: son secciones de la página de la civilización.
export function categoryPath(era: HistoricalEra, category: TopicCategory): string {
  return `${eraPath(era)}#${CATEGORY_ROUTE_SLUGS[category]}`;
}

export function topicPath(topic: Pick<HistoricalTopic, "era" | "category" | "slug">): string {
  return `${eraPath(topic.era)}/${CATEGORY_ROUTE_SLUGS[topic.category]}/${topic.slug}`;
}

// La cronología completa de una civilización. Con los eventos de los temas, lo dice la URL: así esa vista
// se puede compartir y funciona sin JavaScript.
export const TIMELINE_ROUTE_SLUG = "cronologia";
export const TIMELINE_EVENTS_PARAM = { name: "eventos", value: "todos" } as const;

export function eraTimelinePath(era: HistoricalEra, { withTopicEvents = false } = {}): string {
  const path = `${eraPath(era)}/${TIMELINE_ROUTE_SLUG}`;
  return withTopicEvents ? `${path}?${TIMELINE_EVENTS_PARAM.name}=${TIMELINE_EVENTS_PARAM.value}` : path;
}

// Un evento concreto dentro de la página de su tema (el ancla que pinta su cronología).
export function eventPath(topic: Pick<HistoricalTopic, "era" | "category" | "slug">, eventId: string): string {
  return `${topicPath(topic)}#evento-${eventId}`;
}

// Adónde lleva una cita del RAG: el párrafo, el dato o el evento exacto de la página del tema.
export function knowledgeChunkPath(
  topic: Pick<HistoricalTopic, "era" | "category" | "slug">,
  chunk: Pick<KnowledgeChunk, "source" | "position" | "eventId">,
): string {
  const anchors = {
    INTRODUCTION: `introduccion-${chunk.position}`,
    KEY_FACT: `dato-clave-${chunk.position}`,
    EVENT: `evento-${chunk.eventId}`,
  };
  return `${topicPath(topic)}#${anchors[chunk.source]}`;
}
