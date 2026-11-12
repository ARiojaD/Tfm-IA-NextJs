import { describe, expect, it } from "vitest";
import type { TimelineMilestoneRepository } from "@/application/ports/TimelineMilestoneRepository";
import type { TimelineMilestone } from "@/domain/entities/TimelineMilestone";
import { aMilestone } from "../../fixtures/timeline";

export function describeTimelineMilestoneRepositoryContract(
  name: string,
  createRepository: (
    milestones: TimelineMilestone[],
  ) => TimelineMilestoneRepository | Promise<TimelineMilestoneRepository>,
) {
  describe(`${name} cumple el contrato de TimelineMilestoneRepository`, () => {
    const rubicon = aMilestone({
      id: "milestone-rubicon",
      date: { year: -49, month: 1 },
      title: "César cruza el Rubicón",
      topicId: "topic-caesar",
    });
    const punicWar = aMilestone({ id: "milestone-punic-war", date: { year: -264 }, title: "Primera guerra púnica" });
    const marathon = aMilestone({
      id: "milestone-marathon",
      era: "ANCIENT_GREECE",
      date: { year: -490, month: 9 },
      title: "Batalla de Maratón",
    });

    it("lista solo los hitos de la civilización indicada", async () => {
      const repository = await createRepository([rubicon, marathon, punicWar]);

      const milestones = await repository.listByEra("ROMAN");

      expect(milestones).toHaveLength(2);
      expect(milestones).toEqual(expect.arrayContaining([rubicon, punicWar]));
    });

    it("conserva el hito sin tema tal cual, sin `topicId`", async () => {
      const repository = await createRepository([punicWar]);

      expect(await repository.listByEra("ROMAN")).toEqual([punicWar]);
    });

    it("devuelve una lista vacía si la civilización no tiene hitos", async () => {
      const repository = await createRepository([marathon]);

      expect(await repository.listByEra("HISPANIA")).toEqual([]);
    });

    it("devuelve copias: modificar el resultado no altera los datos guardados", async () => {
      const repository = await createRepository([rubicon]);

      const [milestone] = await repository.listByEra("ROMAN");
      milestone.date.year = 1;

      expect((await repository.listByEra("ROMAN"))[0].date.year).toBe(rubicon.date.year);
    });

    describe("replaceForEra (editor)", () => {
      it("sustituye los hitos de una civilización por la lista nueva", async () => {
        const repository = await createRepository([rubicon, punicWar]);
        const edited = { ...rubicon, title: "El paso del Rubicón" };
        const ides = aMilestone({ id: "milestone-ides", date: { year: -44, month: 3 }, title: "Idus de marzo" });

        await repository.replaceForEra("ROMAN", [edited, ides]);

        const milestones = await repository.listByEra("ROMAN");
        expect(milestones).toHaveLength(2);
        expect(milestones).toEqual(expect.arrayContaining([edited, ides]));
      });

      it("con una lista vacía deja la civilización sin hitos", async () => {
        const repository = await createRepository([rubicon, punicWar]);

        await repository.replaceForEra("ROMAN", []);

        expect(await repository.listByEra("ROMAN")).toEqual([]);
      });

      it("no toca los hitos de otras civilizaciones", async () => {
        const repository = await createRepository([rubicon, marathon]);

        await repository.replaceForEra("ROMAN", []);

        expect(await repository.listByEra("ANCIENT_GREECE")).toEqual([marathon]);
      });
    });
  });
}
