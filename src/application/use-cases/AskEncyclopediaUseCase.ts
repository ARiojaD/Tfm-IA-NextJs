import { z } from "zod";
import { type AnswerPart, parseCitations } from "@/domain/entities/EncyclopediaAnswer";
import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { type KnowledgeChunk, KNOWLEDGE_SOURCE_NAMES } from "@/domain/entities/KnowledgeChunk";
import { failure, success, type Result } from "@/shared/Result";
import { AskQuestionInputSchema } from "../dto/AskQuestionInput";
import { AuthenticationRequiredError } from "../errors/AuthenticationRequiredError";
import { InvalidQuestionError } from "../errors/InvalidQuestionError";
import { KnowledgeSearchUnavailableError } from "../errors/KnowledgeSearchUnavailableError";
import { RateLimitExceededError } from "../errors/RateLimitExceededError";
import type { AnswerGenerator } from "../ports/AnswerGenerator";
import type { AuthService } from "../ports/AuthService";
import type { EmbeddingService } from "../ports/EmbeddingService";
import type { ChunkMatch, KnowledgeIndex } from "../ports/KnowledgeIndex";
import type { RateLimiter } from "../ports/RateLimiter";
import type { TopicRepository } from "../ports/TopicRepository";

// How many fragments the model reads. Enough to cover a question that spans several sections of a topic,
// and a bound on what each question costs (OWASP LLM10).
export const MAX_ANSWER_SOURCES = 8;
const MAX_SOURCES_WITHOUT_ANSWER = 5;

export interface AnswerSourceView {
  number: number;
  topic: Pick<HistoricalTopic, "title" | "era" | "category" | "slug">;
  chunk: KnowledgeChunk;
}

export type EncyclopediaAnswer =
  | { status: "ANSWERED"; coverage: "FULL" | "PARTIAL"; parts: AnswerPart[]; missing: string | null; sources: AnswerSourceView[] }
  // The fragments were found but no valid answer could be written: the model is off, or it cited nothing.
  | { status: "SOURCES_ONLY"; sources: AnswerSourceView[] }
  | { status: "NO_INFORMATION" };

export type AskEncyclopediaError =
  | AuthenticationRequiredError
  | RateLimitExceededError
  | InvalidQuestionError
  | KnowledgeSearchUnavailableError;

export interface AskEncyclopediaDependencies {
  auth: AuthService;
  rateLimiter: RateLimiter;
  embeddings: EmbeddingService;
  index: KnowledgeIndex;
  // The public repository: a fragment of a topic that is not published can never be used.
  topics: TopicRepository;
  answers: AnswerGenerator;
  // A first filter, for what is clearly unrelated; it depends on the embedding model. The real decision on
  // whether the fragments answer the question is the language model's (coverage NONE).
  minSimilarity: number;
}

// The RAG: finds the fragments of the encyclopedia closest to the question and has the model answer only
// from them, citing them.
export class AskEncyclopediaUseCase {
  constructor(private readonly dependencies: AskEncyclopediaDependencies) {}

  async execute(input: unknown): Promise<Result<EncyclopediaAnswer, AskEncyclopediaError>> {
    const user = await this.dependencies.auth.getCurrentUser();
    if (!user) {
      return failure(new AuthenticationRequiredError("preguntar a la enciclopedia"));
    }

    const decision = await this.dependencies.rateLimiter.consume(`user:${user.id}`);
    if (!decision.allowed) {
      return failure(new RateLimitExceededError(decision.retryAfterSeconds));
    }

    const parsedInput = AskQuestionInputSchema.safeParse(input);
    if (!parsedInput.success) {
      const { fieldErrors, formErrors } = z.flattenError(parsedInput.error);
      return failure(new InvalidQuestionError(fieldErrors, formErrors));
    }
    const { question } = parsedInput.data;

    const sources = await this.findSources(question);
    if (!sources) {
      return failure(new KnowledgeSearchUnavailableError());
    }
    if (sources.length === 0) {
      return success({ status: "NO_INFORMATION" });
    }
    return success(await this.writeAnswer(question, sources));
  }

  // null when the search itself failed, as opposed to finding nothing.
  private async findSources(question: string): Promise<AnswerSourceView[] | null> {
    const { embeddings, index, topics, minSimilarity } = this.dependencies;
    let matches: ChunkMatch[];
    let published: HistoricalTopic[];
    try {
      matches = await index.search(await embeddings.embedQuery(question), MAX_ANSWER_SOURCES);
      matches = matches.filter((match) => match.similarity >= minSimilarity);
      published = await topics.findByIds([...new Set(matches.map((match) => match.chunk.topicId))]);
    } catch {
      return null;
    }

    const topicsById = new Map(published.map((topic) => [topic.id, topic]));
    return matches.flatMap(({ chunk }) => {
      const topic = topicsById.get(chunk.topicId);
      return topic ? [{ chunk, topic: { title: topic.title, era: topic.era, category: topic.category, slug: topic.slug } }] : [];
    }).map((source, position) => ({ ...source, number: position + 1 }));
  }

  private async writeAnswer(question: string, sources: AnswerSourceView[]): Promise<EncyclopediaAnswer> {
    const onlySources: EncyclopediaAnswer = { status: "SOURCES_ONLY", sources: sources.slice(0, MAX_SOURCES_WITHOUT_ANSWER) };

    let generated;
    try {
      generated = await this.dependencies.answers.answer(
        question,
        sources.map(({ number, topic, chunk }) => ({
          number,
          topicTitle: topic.title,
          section: KNOWLEDGE_SOURCE_NAMES[chunk.source],
          content: chunk.content,
        })),
      );
    } catch {
      return onlySources;
    }

    if (generated.coverage === "NONE") {
      return { status: "NO_INFORMATION" };
    }

    const { parts, citedSources } = parseCitations(generated.answer, sources.length);
    // Every statement must be traceable: an answer that cites nothing is not shown.
    if (citedSources.length === 0) {
      return onlySources;
    }

    return {
      status: "ANSWERED",
      coverage: generated.coverage,
      parts,
      missing: generated.coverage === "PARTIAL" && generated.missing ? generated.missing : null,
      sources: citedSources.map((original, position) => ({ ...sources[original - 1], number: position + 1 })),
    };
  }
}
