import type { Proposal } from "@/domain/entities/Proposal";
import { failure, success, type Result } from "@/shared/Result";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import type { AuthService } from "../ports/AuthService";
import type { ProposalRepository } from "../ports/ProposalRepository";

// "Mis propuestas": the signed-in user's proposals and how they were reviewed. Only their own (BOLA): the
// user comes from the session and the repository lists by user.
export class ListMyProposalsUseCase {
  constructor(private readonly dependencies: { auth: AuthService; proposals: ProposalRepository }) {}

  async execute(): Promise<Result<Proposal[], AuthenticationRequiredError>> {
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("ver tus propuestas"));
    }
    return success(await this.dependencies.proposals.listByUser(user.id));
  }
}
