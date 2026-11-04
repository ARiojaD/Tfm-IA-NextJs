import type { Proposal } from "@/domain/entities/Proposal";
import { success, type Result } from "@/shared/Result";
import type { ProposalRepository } from "../ports/ProposalRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

// The admin's inbox: everyone's pending proposals, oldest first.
export class ListPendingProposalsUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies & { proposals: ProposalRepository }) {}

  async execute(): Promise<Result<Proposal[], AdminAuthorizationError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;
    return success(await this.dependencies.proposals.listPending());
  }
}
