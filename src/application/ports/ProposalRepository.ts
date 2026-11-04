import type { Proposal } from "@/domain/entities/Proposal";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface ProposalRepository {
  add(proposal: Proposal): Promise<void>;
  findById(id: EntityId): Promise<Proposal | null>;
  // One user's proposals, newest first. Scoped to the user: nobody lists another user's proposals.
  listByUser(userId: EntityId): Promise<Proposal[]>;
  // The admin's inbox: the pending proposals of everyone, oldest first (first come, first reviewed).
  listPending(): Promise<Proposal[]>;
  // Saves the review (status, note, date, reviewer) of an existing proposal.
  save(proposal: Proposal): Promise<void>;
}
