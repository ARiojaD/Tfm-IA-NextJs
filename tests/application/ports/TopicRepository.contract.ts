import { describe, expect, it } from "vitest";
import type { TopicRepository } from "@/application/ports/TopicRepository";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { aTopic } from "../../fixtures/historicalTopics";

// Contract every TopicRepository implementation must pass (in-memory today, PostgreSQL later).
export function describeTopicRepositoryContract(
  name: string,
  createRepository: (topics: HistoricalTopic[]) => TopicRepository | Promise<TopicRepository>,
) {
  describe(`${name} cumple el contrato de TopicRepository`, () => {
    const caesar = aTopic({ id: "topic-caesar", slug: "julio-cesar", title: "Julio César" });
    const pericles = aTopic({ id: "topic-pericles", slug: "pericles", title: "Pericles", era: "ANCIENT_GREECE" });

    it("encuentra un tema por su slug", async () => {
      const repository = await createRepository([caesar, pericles]);

      expect(await repository.findBySlug("julio-cesar")).toEqual(caesar);
    });

    it("devuelve null si no existe ningún tema con ese slug", async () => {
      const repository = await createRepository([caesar]);

      expect(await repository.findBySlug("augusto")).toBeNull();
    });

    it("lista solo los temas de la época indicada", async () => {
      const augustus = aTopic({ id: "topic-augustus", slug: "augusto", title: "Augusto" });
      const repository = await createRepository([caesar, pericles, augustus]);

      const topics = await repository.listByEra("ROMAN");

      expect(topics).toHaveLength(2);
      expect(topics).toEqual(expect.arrayContaining([caesar, augustus]));
    });

    it("devuelve una lista vacía si la época no tiene temas", async () => {
      const repository = await createRepository([caesar]);

      expect(await repository.listByEra("HISPANIA")).toEqual([]);
    });

    it("encuentra varios temas por sus ids", async () => {
      const augustus = aTopic({ id: "topic-augustus", slug: "augusto", title: "Augusto" });
      const repository = await createRepository([caesar, pericles, augustus]);

      const topics = await repository.findByIds(["topic-augustus", "topic-pericles"]);

      expect(topics).toHaveLength(2);
      expect(topics).toEqual(expect.arrayContaining([augustus, pericles]));
    });

    it("ignora los ids que no corresponden a ningún tema", async () => {
      const repository = await createRepository([caesar]);

      expect(await repository.findByIds(["topic-caesar", "topic-missing"])).toEqual([caesar]);
    });

    it("devuelve una lista vacía si no se pide ningún id", async () => {
      const repository = await createRepository([caesar]);

      expect(await repository.findByIds([])).toEqual([]);
    });

    it("devuelve copias: modificar el resultado no altera los datos guardados", async () => {
      const repository = await createRepository([caesar]);

      const found = await repository.findBySlug("julio-cesar");
      found!.title = "Modificado";

      expect((await repository.findBySlug("julio-cesar"))?.title).toBe("Julio César");
    });
  });
}
