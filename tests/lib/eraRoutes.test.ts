import { describe, expect, it } from "vitest";
import { HISTORICAL_ERAS } from "@/domain/value-objects/HistoricalEra";
import { ERA_ROUTE_SLUGS, eraFromRouteSlug, topicPath } from "@/lib/eraRoutes";

describe("eraRoutes", () => {
  it("construye la ruta de un tema a partir de su época y su slug", () => {
    expect(topicPath({ era: "ROMAN", slug: "julio-cesar" })).toBe("/roma/julio-cesar");
  });

  it.each([
    ["roma", "ROMAN"],
    ["grecia", "ANCIENT_GREECE"],
    ["hispania", "HISPANIA"],
  ])("traduce el segmento de URL %s a la época %s", (routeSlug, era) => {
    expect(eraFromRouteSlug(routeSlug)).toBe(era);
  });

  it.each(["atlantida", "Roma", ""])("devuelve null para un segmento de época desconocido: %j", (routeSlug) => {
    expect(eraFromRouteSlug(routeSlug)).toBeNull();
  });

  it("cada época tiene un segmento de URL propio", () => {
    const routeSlugs = HISTORICAL_ERAS.map((era) => ERA_ROUTE_SLUGS[era]);

    expect(new Set(routeSlugs).size).toBe(HISTORICAL_ERAS.length);
  });
});
