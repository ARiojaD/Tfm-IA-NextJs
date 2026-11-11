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

// Un tope a lo que puede costar una propuesta (OWASP LLM10): mayor que el de una respuesta, porque es una
// lista entera.
const MAX_OUTPUT_TOKENS = 2000;

// Las propuestas de la IA (cronología y quiz para el panel, campos de una propuesta para los usuarios) con
// el modelo de lenguaje configurado. El nombre de cada esquema identifica la llamada en el registro de
// fallos y en el servidor falso de los E2E.
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
