import { describe, expect, it } from "vitest";
import { ListTopicsByEraUseCase } from "@/application/use-cases/ListTopicsByEraUseCase";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { aTopic } from "../../fixtures/historicalTopics";

const listTopics = (topics: HistoricalTopic[]) =>
  new ListTopicsByEraUseCase({ topics: new InMemoryTopicRepository(topics) });

const caesar = aTopic({ id: "t-caesar", slug: "julio-cesar", title: "Julio César", category: "PEOPLE" });
const augustus = aTopic({ id: "t-augustus", slug: "augusto", title: "Augusto", category: "PEOPLE" });
const alesia = aTopic({ id: "t-alesia", slug: "alesia", title: "Asedio de Alesia", category: "WARS_AND_BATTLES" });
const republic = aTopic({ id: "t-republic", slug: "republica", title: "República", category: "PERIODS" });
const pericles = aTopic({ id: "t-pericles", slug: "pericles", title: "Pericles", era: "ANCIENT_GREECE" });

describe("ListTopicsByEraUseCase", () => {
  it("agrupa los temas de la época por categoría, en el orden fijo de las categorías", async () => {
    const overview = await listTopics([republic, caesar, alesia]).execute("ROMAN");

    expect(overview.categories.map((group) => group.category)).toEqual(["PEOPLE", "WARS_AND_BATTLES", "PERIODS"]);
  });

  it("omite las categorías sin temas", async () => {
    const overview = await listTopics([caesar]).execute("ROMAN");

    expect(overview.categories).toEqual([{ category: "PEOPLE", topics: [caesar] }]);
  });

  it("no incluye temas de otras épocas", async () => {
    const overview = await listTopics([caesar, pericles]).execute("ROMAN");

    expect(overview.totalTopics).toBe(1);
  });

  it("ordena alfabéticamente los temas de cada categoría, respetando las tildes", async () => {
    const overview = await listTopics([caesar, augustus]).execute("ROMAN");

    expect(overview.categories[0].topics.map((topic) => topic.title)).toEqual(["Augusto", "Julio César"]);
  });

  it("devuelve la época sin categorías si todavía no tiene temas", async () => {
    expect(await listTopics([caesar]).execute("HISPANIA")).toEqual({ era: "HISPANIA", totalTopics: 0, categories: [] });
  });
});
