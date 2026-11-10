import { describe, expect, it } from "vitest";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { TOPIC_CATEGORIES } from "@/domain/value-objects/TopicCategory";
import {
  CATEGORY_ROUTE_SLUGS,
  categoryFromRouteSlug,
  categoryPath,
  ERA_ROUTE_SLUGS,
  eraFromRouteSlug,
  eraPath,
  knowledgeChunkPath,
  topicPath,
} from "@/lib/routes";

describe("routes", () => {
  it("construye la ruta de un tema con su civilización, su categoría y su slug", () => {
    expect(topicPath({ era: "ROMAN", category: "PEOPLE", slug: "julio-cesar" })).toBe("/roma/personajes/julio-cesar");
  });

  it("construye la ruta de una civilización", () => {
    expect(eraPath("ANCIENT_GREECE")).toBe("/grecia");
  });

  it("la ruta de una categoría lleva a su sección dentro de la civilización", () => {
    expect(categoryPath("ROMAN", "WARS_AND_BATTLES")).toBe("/roma#guerras-y-batallas");
  });

  it.each([
    ["roma", "ROMAN"],
    ["grecia", "ANCIENT_GREECE"],
    ["hispania", "HISPANIA"],
  ])("traduce el segmento de URL %s a la época %s", (routeSlug, era) => {
    expect(eraFromRouteSlug(routeSlug)).toBe(era);
  });

  it.each([
    ["personajes", "PEOPLE"],
    ["guerras-y-batallas", "WARS_AND_BATTLES"],
    ["etapas", "PERIODS"],
    ["ciudades", "CITIES"],
  ])("traduce el segmento de URL %s a la categoría %s", (routeSlug, category) => {
    expect(categoryFromRouteSlug(routeSlug)).toBe(category);
  });

  it.each(["atlantida", "Roma", ""])("devuelve null para un segmento de época desconocido: %j", (routeSlug) => {
    expect(eraFromRouteSlug(routeSlug)).toBeNull();
  });

  it.each(["mitos", "julio-cesar", ""])("devuelve null para un segmento de categoría desconocido: %j", (routeSlug) => {
    expect(categoryFromRouteSlug(routeSlug)).toBeNull();
  });

  it("cada época y cada categoría tienen un segmento de URL propio", () => {
    expect(new Set(HISTORICAL_ERAS.map((era) => ERA_ROUTE_SLUGS[era])).size).toBe(HISTORICAL_ERAS.length);
    expect(new Set(TOPIC_CATEGORIES.map((category) => CATEGORY_ROUTE_SLUGS[category])).size).toBe(
      TOPIC_CATEGORIES.length,
    );
  });
});

describe("knowledgeChunkPath", () => {
  const topic = { era: "ROMAN", category: "PEOPLE", slug: "julio-cesar" } as const;

  it("un párrafo de la introducción enlaza a ese párrafo", () => {
    expect(knowledgeChunkPath(topic, { source: "INTRODUCTION", position: 2 })).toBe("/roma/personajes/julio-cesar#introduccion-2");
  });

  it("un dato clave enlaza a ese dato", () => {
    expect(knowledgeChunkPath(topic, { source: "KEY_FACT", position: 1 })).toBe("/roma/personajes/julio-cesar#dato-clave-1");
  });

  it("un evento enlaza a ese evento de la cronología, por su id", () => {
    expect(knowledgeChunkPath(topic, { source: "EVENT", position: 0, eventId: "event-rubicon" })).toBe(
      "/roma/personajes/julio-cesar#evento-event-rubicon",
    );
  });
});
