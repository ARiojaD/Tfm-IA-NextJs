import { describe, expect, it } from "vitest";
import type { ProposalRepository } from "@/application/ports/ProposalRepository";
import type { Proposal } from "@/domain/entities/Proposal";
import { aProposal } from "../../fixtures/proposals";

// In PostgreSQL the users and the topic must exist (foreign keys): the integration test creates them.
export const PROPOSAL_CONTRACT_USERS = ["user-1", "user-2"] as const;
export const PROPOSAL_CONTRACT_TOPIC = "topic-caesar";

const at = (day: number) => new Date(Date.UTC(2026, 10, day, 10));

export function describeProposalRepositoryContract(
  name: string,
  createRepository: () => ProposalRepository | Promise<ProposalRepository>,
) {
  describe(`${name} cumple el contrato de ProposalRepository`, () => {
    const event = aProposal({ kind: "EVENT", id: "p-event", createdAt: at(1) });
    const recommendation = aProposal({ kind: "RECOMMENDATION", id: "p-recommendation", createdAt: at(2) });
    const correction = aProposal({ kind: "CORRECTION", id: "p-correction", createdAt: at(3) });
    const newTopic = aProposal({ kind: "NEW_TOPIC", id: "p-new-topic", userId: "user-2", authorName: "Marco", createdAt: at(4) });

    async function withAll() {
      const repository = await createRepository();
      for (const proposal of [event, recommendation, correction, newTopic]) await repository.add(proposal);
      return repository;
    }

    it.each([event, recommendation, correction, newTopic].map((proposal) => [proposal.kind, proposal] as const))(
      "guarda y recupera una propuesta de tipo %s tal cual",
      async (_kind, proposal: Proposal) => {
        const repository = await withAll();

        expect(await repository.findById(proposal.id)).toEqual(proposal);
      },
    );

    it("devuelve null si no existe la propuesta", async () => {
      const repository = await withAll();

      expect(await repository.findById("p-missing")).toBeNull();
    });

    it("lista solo las propuestas del usuario, de la más reciente a la más antigua", async () => {
      const repository = await withAll();

      expect((await repository.listByUser("user-1")).map((proposal) => proposal.id)).toEqual([
        "p-correction",
        "p-recommendation",
        "p-event",
      ]);
      expect((await repository.listByUser("user-2")).map((proposal) => proposal.id)).toEqual(["p-new-topic"]);
    });

    it("la bandeja muestra las pendientes de todos, de la más antigua a la más reciente", async () => {
      const repository = await withAll();

      expect((await repository.listPending()).map((proposal) => proposal.id)).toEqual([
        "p-event",
        "p-recommendation",
        "p-correction",
        "p-new-topic",
      ]);
    });

    it("guarda la revisión: la propuesta deja de estar pendiente", async () => {
      const repository = await withAll();
      const rejected: Proposal = {
        ...correction,
        status: "REJECTED",
        reviewNote: "La fecha ya es correcta.",
        reviewedAt: at(5),
        reviewedBy: "user-2",
      };

      await repository.save(rejected);

      expect(await repository.findById("p-correction")).toEqual(rejected);
      expect((await repository.listPending()).map((proposal) => proposal.id)).not.toContain("p-correction");
    });

    it("devuelve copias: modificar el resultado no altera lo guardado", async () => {
      const repository = await withAll();

      const found = await repository.findById("p-correction");
      if (found?.kind === "CORRECTION") found.message = "Modificado";

      expect(await repository.findById("p-correction")).toEqual(correction);
    });
  });
}
