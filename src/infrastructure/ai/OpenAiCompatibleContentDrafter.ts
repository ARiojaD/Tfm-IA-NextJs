import type { LanguageModel } from "ai";
import type { z } from "zod";
import type { ContentDrafter, TopicSource } from "@/application/ports/ContentDrafter";
import type { ProposalDrafter } from "@/application/ports/ProposalDrafter";
import {
  type GeneratedEventProposal,
  GeneratedEventProposalSchema,
  type GeneratedNewTopicProposal,
  GeneratedNewTopicProposalSchema,
} from "@/domain/entities/ProposalDrafts";
import { type GeneratedEvents, GeneratedEventsSchema, type GeneratedQuiz, GeneratedQuizSchema } from "@/domain/entities/TopicDrafts";
import { buildEventProposalPrompt, buildEventsDraftPrompt, buildNewTopicProposalPrompt, buildQuizDraftPrompt } from "./draftPrompts";
import { createLanguageModel, generateStructured, type LlmConfig } from "./languageModel";

// A bound on what one proposal can cost (OWASP LLM10): larger than an answer, it is a whole list.
const MAX_OUTPUT_TOKENS = 2000;

export class OpenAiCompatibleContentDrafter implements ContentDrafter, ProposalDrafter {
  private readonly model: LanguageModel;

  constructor(private readonly config: LlmConfig) {
    this.model = createLanguageModel(config);
  }

  draftEvents(source: TopicSource): Promise<GeneratedEvents> {
    return this.generate(buildEventsDraftPrompt(source), GeneratedEventsSchema, "cronologia");
  }

  draftQuiz(source: TopicSource): Promise<GeneratedQuiz> {
    return this.generate(buildQuizDraftPrompt(source), GeneratedQuizSchema, "quiz");
  }

  draftEventProposal(fragment: string): Promise<GeneratedEventProposal> {
    return this.generate(buildEventProposalPrompt(fragment), GeneratedEventProposalSchema, "propuesta_evento");
  }

  draftNewTopicProposal(fragment: string): Promise<GeneratedNewTopicProposal> {
    return this.generate(buildNewTopicProposalPrompt(fragment), GeneratedNewTopicProposalSchema, "propuesta_tema");
  }

  private generate<Schema extends z.ZodType<object>>(
    prompt: { system: string; prompt: string },
    schema: Schema,
    name: string,
  ): Promise<z.output<Schema>> {
    return generateStructured(this.model, this.config, { ...prompt, schema, name, maxOutputTokens: MAX_OUTPUT_TOKENS });
  }
}
