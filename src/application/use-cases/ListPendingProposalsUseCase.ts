import type { Proposal } from "@/domain/entities/Proposal";
import { success, type Result } from "@/shared/Result";
import type { ProposalRepository } from "../ports/ProposalRepository";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

// La bandeja del administrador: las propuestas pendientes de todos, de la más antigua a la más reciente.
export class ListPendingProposalsUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies & { proposals: ProposalRepository }) {}

  async execute(): Promise<Result<Proposal[], AdminAuthorizationError>> {
    const access = await authorizeAdmin(this.dependencies);
    if (!access.success) return access;
    return success(await this.dependencies.proposals.listPending());
  }
}
