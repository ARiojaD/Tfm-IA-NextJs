import { describe, expect, it } from "vitest";
import type { RecommendationRepository } from "@/application/ports/RecommendationRepository";
import type { Recommendation } from "@/domain/entities/Recommendation";
import { aRecommendation } from "../../fixtures/historicalTopics";

export function describeRecommendationRepositoryContract(
  name: string,
  createRepository: (
    recommendations: Recommendation[],
  ) => RecommendationRepository | Promise<RecommendationRepository>,
) {
  describe(`${name} cumple el contrato de RecommendationRepository`, () => {
    const book = aRecommendation({ id: "rec-book", topicId: "topic-caesar", type: "BOOK" });
    const series = aRecommendation({ id: "rec-series", topicId: "topic-caesar", type: "SERIES" });
    const film = aRecommendation({ id: "rec-film", topicId: "topic-pericles", type: "FILM" });

    it("lista solo las recomendaciones del tema indicado", async () => {
      const repository = await createRepository([book, film, series]);

      const recommendations = await repository.listByTopic("topic-caesar");

      expect(recommendations).toHaveLength(2);
      expect(recommendations).toEqual(expect.arrayContaining([book, series]));
    });

    it("devuelve una lista vacía si el tema no tiene recomendaciones", async () => {
      const repository = await createRepository([film]);

      expect(await repository.listByTopic("topic-caesar")).toEqual([]);
    });

    it("devuelve copias: modificar el resultado no altera los datos guardados", async () => {
      const repository = await createRepository([book]);

      const [recommendation] = await repository.listByTopic("topic-caesar");
      recommendation.title = "Modificado";

      expect((await repository.listByTopic("topic-caesar"))[0].title).toBe(book.title);
    });

    describe("replaceForTopic (editor)", () => {
      it("sustituye las recomendaciones de un tema por la lista nueva", async () => {
        const repository = await createRepository([book, series]);
        const edited = { ...book, title: "Otro libro" };

        await repository.replaceForTopic("topic-caesar", [edited]);

        expect(await repository.listByTopic("topic-caesar")).toEqual([edited]);
      });

      it("no toca las recomendaciones de otros temas", async () => {
        const repository = await createRepository([book, film]);

        await repository.replaceForTopic("topic-caesar", []);

        expect(await repository.listByTopic("topic-caesar")).toEqual([]);
        expect(await repository.listByTopic("topic-pericles")).toEqual([film]);
      });
    });
  });
}
