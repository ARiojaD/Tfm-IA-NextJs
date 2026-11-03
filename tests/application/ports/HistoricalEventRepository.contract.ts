import { describe, expect, it } from "vitest";
import type { HistoricalEventRepository } from "@/application/ports/HistoricalEventRepository";
import type { HistoricalEvent } from "@/domain/entities/HistoricalEvent";
import { anEvent } from "../../fixtures/historicalTopics";

export function describeHistoricalEventRepositoryContract(
  name: string,
  createRepository: (
    events: HistoricalEvent[],
  ) => HistoricalEventRepository | Promise<HistoricalEventRepository>,
) {
  describe(`${name} cumple el contrato de HistoricalEventRepository`, () => {
    const rubicon = anEvent({ id: "event-rubicon", topicId: "topic-caesar", title: "Cruce del Rubicón" });
    const pharsalus = anEvent({ id: "event-pharsalus", topicId: "topic-caesar", title: "Batalla de Farsalia" });
    const marathon = anEvent({ id: "event-marathon", topicId: "topic-persian-wars", title: "Batalla de Maratón" });

    it("lista solo los eventos del tema indicado", async () => {
      const repository = await createRepository([rubicon, marathon, pharsalus]);

      const events = await repository.listByTopic("topic-caesar");

      expect(events).toHaveLength(2);
      expect(events).toEqual(expect.arrayContaining([rubicon, pharsalus]));
    });

    it("devuelve una lista vacía si el tema no tiene eventos", async () => {
      const repository = await createRepository([marathon]);

      expect(await repository.listByTopic("topic-caesar")).toEqual([]);
    });

    it("devuelve copias: modificar el resultado no altera los datos guardados", async () => {
      const repository = await createRepository([rubicon]);

      const [event] = await repository.listByTopic("topic-caesar");
      event.date.year = 1;

      expect((await repository.listByTopic("topic-caesar"))[0].date.year).toBe(rubicon.date.year);
    });

    describe("replaceForTopic (editor)", () => {
      it("sustituye los eventos de un tema por la lista nueva", async () => {
        const repository = await createRepository([rubicon, pharsalus]);
        const edited = { ...rubicon, title: "Cruce del Rubicón (49 a.C.)" };
        const ides = anEvent({ id: "event-ides", topicId: "topic-caesar", title: "Idus de marzo" });

        await repository.replaceForTopic("topic-caesar", [edited, ides]);

        const events = await repository.listByTopic("topic-caesar");
        expect(events).toHaveLength(2);
        expect(events).toEqual(expect.arrayContaining([edited, ides]));
      });

      it("con una lista vacía deja el tema sin eventos", async () => {
        const repository = await createRepository([rubicon, pharsalus]);

        await repository.replaceForTopic("topic-caesar", []);

        expect(await repository.listByTopic("topic-caesar")).toEqual([]);
      });

      it("no toca los eventos de otros temas", async () => {
        const repository = await createRepository([rubicon, marathon]);

        await repository.replaceForTopic("topic-caesar", []);

        expect(await repository.listByTopic("topic-persian-wars")).toEqual([marathon]);
      });
    });
  });
}
