import type { ProposalRepository } from "@/application/ports/ProposalRepository";
import type { Proposal } from "@/domain/entities/Proposal";
import type { EntityId } from "@/domain/value-objects/EntityId";

// Proposals of this process only (unit tests): lost when it stops.
export class InMemoryProposalRepository implements ProposalRepository {
  private readonly proposals = new Map<EntityId, Proposal>();

  add(proposal: Proposal): Promise<void> {
    this.proposals.set(proposal.id, structuredClone(proposal));
    return Promise.resolve();
  }

  findById(id: EntityId): Promise<Proposal | null> {
    const proposal = this.proposals.get(id);
    return Promise.resolve(proposal ? structuredClone(proposal) : null);
  }

  listByUser(userId: EntityId): Promise<Proposal[]> {
    const own = [...this.proposals.values()].filter((proposal) => proposal.userId === userId);
    return Promise.resolve(structuredClone(own.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime())));
  }

  listPending(): Promise<Proposal[]> {
    const pending = [...this.proposals.values()].filter((proposal) => proposal.status === "PENDING");
    return Promise.resolve(structuredClone(pending.toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())));
  }

  save(proposal: Proposal): Promise<void> {
    this.proposals.set(proposal.id, structuredClone(proposal));
    return Promise.resolve();
  }
}
