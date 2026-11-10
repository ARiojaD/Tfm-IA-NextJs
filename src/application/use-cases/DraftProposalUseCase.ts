import {
  type EventProposalValues,
  eventProposalValues,
  type NewTopicProposalValues,
  newTopicProposalValues,
} from "@/domain/entities/ProposalDrafts";
import { failure, success, type Result } from "@/shared/Result";
import { DraftProposalInputSchema } from "../dto/ProposalInputs";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import { InvalidProposalError } from "../errors/InvalidProposalError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import { TopicDraftError } from "../errors/TopicDraftError";
import type { AuthService } from "../ports/AuthService";
import type { ProposalDrafter } from "../ports/ProposalDrafter";
import type { RateLimiter } from "../ports/RateLimiter";

export type ProposalDraft =
  | { kind: "EVENT"; values: EventProposalValues }
  | { kind: "NEW_TOPIC"; values: NewTopicProposalValues };

export type DraftProposalError = AuthenticationRequiredError | RateLimitExceededError | InvalidProposalError | TopicDraftError;

export interface DraftProposalDependencies {
  auth: AuthService;
  rateLimiter: RateLimiter;
  drafter: ProposalDrafter;
}

// Fills a proposal's form from a fragment the user pasted. It only returns the fields: the user reviews
// them, adds the source and sends the proposal, which an administrator still has to approve.
export class DraftProposalUseCase {
  constructor(private readonly dependencies: DraftProposalDependencies) {}

  async execute(input: unknown): Promise<Result<ProposalDraft, DraftProposalError>> {
    const { auth, rateLimiter, drafter } = this.dependencies;

    const user = await auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("rellenar propuestas con IA"));
    }

    const decision = await rateLimiter.consume(`user:${user.id}`);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

    const parsed = DraftProposalInputSchema.safeParse(input);
    if (!parsed.success) {
      return failure(InvalidProposalError.fromIssues(parsed.error.issues));
    }
    const { kind, text } = parsed.data;

    try {
      if (kind === "EVENT") {
        const generated = await drafter.draftEventProposal(text);
        return generated.found ? success({ kind, values: eventProposalValues(generated, text) }) : failure(new TopicDraftError("EMPTY"));
      }
      const generated = await drafter.draftNewTopicProposal(text);
      return generated.found ? success({ kind, values: newTopicProposalValues(generated, text) }) : failure(new TopicDraftError("EMPTY"));
    } catch {
      return failure(new TopicDraftError("UNAVAILABLE"));
    }
  }
}
