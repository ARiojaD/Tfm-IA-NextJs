import { type Proposal, ProposalSchema } from "@/domain/entities/Proposal";
import { failure, success, type Result } from "@/shared/Result";
import { ProposalKindInputSchema, SUBMIT_PROPOSAL_SCHEMAS } from "../dto/ProposalInputs";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import { InvalidProposalError } from "../errors/InvalidProposalError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { AuthService } from "../ports/AuthService";
import type { Clock } from "../ports/Clock";
import type { IdGenerator } from "../ports/IdGenerator";
import type { ProposalRepository } from "../ports/ProposalRepository";
import type { RateLimiter } from "../ports/RateLimiter";
import type { TopicRepository } from "../ports/TopicRepository";

export interface SubmitProposalDependencies {
  auth: AuthService;
  // La cara pública: solo se puede proponer sobre temas publicados.
  topics: TopicRepository;
  proposals: ProposalRepository;
  ids: IdGenerator;
  clock: Clock;
  rateLimiter: RateLimiter;
}

export type SubmitProposalError = AuthenticationRequiredError | RateLimitExceededError | InvalidProposalError | TopicNotFoundError;

// Un usuario con sesión propone un evento, una recomendación, una corrección o un tema nuevo. Queda
// pendiente (PENDING) hasta que la revise un administrador: todavía no cambia nada en la web.
export class SubmitProposalUseCase {
  constructor(private readonly dependencies: SubmitProposalDependencies) {}

  async execute(input: unknown): Promise<Result<Proposal, SubmitProposalError>> {
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("proponer cambios"));
    }

    // Por usuario y antes de validar, para que cuenten todos los intentos.
    const decision = await this.dependencies.rateLimiter.consume(`user:${user.id}`);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

    // Primero el tipo y después el esquema de ese tipo.
    const kind = ProposalKindInputSchema.safeParse(input);
    if (!kind.success) {
      return failure(InvalidProposalError.fromIssues(kind.error.issues));
    }
    const parsed = SUBMIT_PROPOSAL_SCHEMAS[kind.data.kind].safeParse(input);
    if (!parsed.success) {
      return failure(InvalidProposalError.fromIssues(parsed.error.issues));
    }

    // Quién y cuándo salen del servidor; el tema, de su slug (solo temas publicados).
    const common = {
      id: this.dependencies.ids.generate(),
      userId: user.id,
      authorName: user.name,
      status: "PENDING" as const,
      createdAt: this.dependencies.clock.now(),
    };
    let candidate: unknown;
    if (parsed.data.kind === "NEW_TOPIC") {
      candidate = { ...common, ...parsed.data };
    } else {
      const { topicSlug, ...proposed } = parsed.data;
      const topic = await this.dependencies.topics.findBySlug(topicSlug);
      if (!topic) {
        return failure(new TopicNotFoundError(topicSlug));
      }
      candidate = { ...common, ...proposed, topicId: topic.id, topicTitle: topic.title };
    }

    const proposal = ProposalSchema.parse(candidate);
    await this.dependencies.proposals.add(proposal);
    return success(proposal);
  }
}
