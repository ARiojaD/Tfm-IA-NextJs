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

// Rellena el formulario de una propuesta a partir de un fragmento que pegó el usuario. Solo devuelve los
// campos: el usuario los revisa, añade la fuente y envía la propuesta, que aún tiene que aprobar un
// administrador.
export class DraftProposalUseCase {
  constructor(private readonly dependencies: DraftProposalDependencies) {}

  async execute(input: unknown): Promise<Result<ProposalDraft, DraftProposalError>> {
    const { auth, rateLimiter, drafter } = this.dependencies;

    const user = await auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("rellenar propuestas con IA"));
    }

    // Por usuario y antes de validar: cada petición puede acabar en una llamada al modelo (OWASP LLM10).
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
