import { asc, desc, eq } from "drizzle-orm";
import type { ProposalRepository } from "@/application/ports/ProposalRepository";
import type { Proposal } from "@/domain/entities/Proposal";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Database } from "./client";
import { toProposal, toProposalRow } from "./mappers";
import { proposals } from "./schema";

export class PostgresProposalRepository implements ProposalRepository {
  constructor(private readonly db: Database) {}

  async add(proposal: Proposal): Promise<void> {
    await this.db.insert(proposals).values(toProposalRow(proposal));
  }

  async findById(id: EntityId): Promise<Proposal | null> {
    const [row] = await this.db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
    return row ? toProposal(row) : null;
  }

  async listByUser(userId: EntityId): Promise<Proposal[]> {
    const rows = await this.db
      .select()
      .from(proposals)
      .where(eq(proposals.userId, userId))
      .orderBy(desc(proposals.createdAt));
    return rows.map(toProposal);
  }

  async listPending(): Promise<Proposal[]> {
    const rows = await this.db
      .select()
      .from(proposals)
      .where(eq(proposals.status, "PENDING"))
      .orderBy(asc(proposals.createdAt));
    return rows.map(toProposal);
  }

  // Only the review changes: who proposed what never does.
  async save(proposal: Proposal): Promise<void> {
    const { status, reviewNote, reviewedAt, reviewedBy } = toProposalRow(proposal);
    await this.db.update(proposals).set({ status, reviewNote, reviewedAt, reviewedBy }).where(eq(proposals.id, proposal.id));
  }
}
