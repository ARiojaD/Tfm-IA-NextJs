import { HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import type { Proposal } from "@/domain/entities/Proposal";
import { RecommendationSchema } from "@/domain/entities/Recommendation";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { failure, success, type Result } from "@/shared/Result";
import { ReviewProposalInputSchema } from "../dto/ProposalInputs";
import { InvalidProposalError } from "../errors/InvalidProposalError";
import type { InvalidTopicError } from "../errors/InvalidTopicError";
import { ProposalAlreadyReviewedError } from "../errors/ProposalAlreadyReviewedError";
import { ProposalNotFoundError } from "../errors/ProposalNotFoundError";
import { TopicNotFoundError } from "../errors/TopicNotFoundError";
import type { Clock } from "../ports/Clock";
import type { HistoricalEventRepository } from "../ports/HistoricalEventRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import type { ProposalRepository } from "../ports/ProposalRepository";
import type { RecommendationRepository } from "../ports/RecommendationRepository";
import { type AdminWriteError, authorizeAdminWrite } from "./authorizeAdmin";
import { saveValidTopic, type TopicEditingDependencies, uniqueSlug } from "./topicEditing";

export interface ReviewProposalDependencies extends TopicEditingDependencies {
  proposals: ProposalRepository;
  events: HistoricalEventRepository;
  recommendations: RecommendationRepository;
  ids: IdGenerator;
  clock: Clock;
}

export type ReviewProposalError =
  | AdminWriteError
  | InvalidProposalError
  | ProposalNotFoundError
  | ProposalAlreadyReviewedError
  | TopicNotFoundError
  | InvalidTopicError;

// Un administrador aprueba o rechaza una propuesta pendiente. Aprobarla la aplica: el evento o la
// recomendación se añaden al tema, un tema nuevo pasa a ser un borrador que completar y una corrección se
// marca como resuelta (el administrador edita el tema a mano). Rechazarla exige un motivo, que ve el
// usuario.
export class ReviewProposalUseCase {
  constructor(private readonly dependencies: ReviewProposalDependencies) {}

  async execute(input: unknown): Promise<Result<{ proposal: Proposal; createdTopicId?: EntityId }, ReviewProposalError>> {
    const access = await authorizeAdminWrite(this.dependencies);
    if (!access.success) return access;

    const parsed = ReviewProposalInputSchema.safeParse(input);
    if (!parsed.success) {
      return failure(InvalidProposalError.fromIssues(parsed.error.issues));
    }
    const { proposalId, decision, note } = parsed.data;

    const proposal = await this.dependencies.proposals.findById(proposalId);
    if (!proposal) {
      return failure(new ProposalNotFoundError(proposalId));
    }
    // Se revisa una sola vez: aprobarla dos veces añadiría dos veces su evento o su recomendación.
    if (proposal.status !== "PENDING") {
      return failure(new ProposalAlreadyReviewedError());
    }

    let createdTopicId: EntityId | undefined;
    if (decision === "approve") {
      const applied = await this.apply(proposal);
      if (!applied.success) return applied;
      createdTopicId = applied.data;
    }

    const reviewed: Proposal = {
      ...proposal,
      status: decision === "approve" ? "APPROVED" : "REJECTED",
      ...(note !== "" && { reviewNote: note }),
      reviewedAt: this.dependencies.clock.now(),
      reviewedBy: access.data.id,
    };
    await this.dependencies.proposals.save(reviewed);
    return success({ proposal: reviewed, ...(createdTopicId !== undefined && { createdTopicId }) });
  }

  // Lo que cambia en la web al aprobar. Devuelve el id del borrador creado para un tema nuevo.
  private async apply(proposal: Proposal): Promise<Result<EntityId | undefined, TopicNotFoundError | InvalidTopicError>> {
    const { topicEditor, events, recommendations, ids } = this.dependencies;

    if (proposal.kind === "NEW_TOPIC") {
      const { description, ...basics } = proposal.newTopic;
      const saved = await saveValidTopic(topicEditor, {
        id: ids.generate(),
        slug: await uniqueSlug(topicEditor, basics.title),
        ...basics,
        // La descripción de la propuesta es la primera introducción del borrador, para que la rehaga el
        // administrador.
        introduction: description
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.trim())
          .filter((paragraph) => paragraph.length > 0),
        keyFacts: [],
        relatedTopicIds: [],
        status: "DRAFT",
      });
      return saved.success ? success(saved.data.id) : saved;
    }
    if (proposal.kind === "CORRECTION") {
      return success(undefined);
    }

    const topic = await topicEditor.findById(proposal.topicId);
    if (!topic) {
      return failure(new TopicNotFoundError(proposal.topicId));
    }
    // El evento o la recomendación se añaden al final de la lista del tema (la página ordena los eventos
    // por fecha).
    if (proposal.kind === "EVENT") {
      const event = HistoricalEventSchema.parse({ ...proposal.event, id: ids.generate(), topicId: topic.id, era: topic.era });
      await events.replaceForTopic(topic.id, [...(await events.listByTopic(topic.id)), event]);
    } else {
      const recommendation = RecommendationSchema.parse({ ...proposal.recommendation, id: ids.generate(), topicId: topic.id });
      await recommendations.replaceForTopic(topic.id, [...(await recommendations.listByTopic(topic.id)), recommendation]);
    }
    return success(undefined);
  }
}
