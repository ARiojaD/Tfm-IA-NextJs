import { type EventDraftRow, eventDraftRows } from "@/domain/entities/TopicDrafts";
import type { Result } from "@/shared/Result";
import { draftFromTopic, type TopicDraftingDependencies, type TopicDraftingError } from "./topicDrafting";

// La IA propone una cronología a partir del texto del tema. Solo rellena el formulario: guardar es cosa
// del administrador.
export class DraftTopicEventsUseCase {
  constructor(private readonly dependencies: TopicDraftingDependencies) {}

  execute(input: unknown): Promise<Result<EventDraftRow[], TopicDraftingError>> {
    return draftFromTopic(this.dependencies, input, (source) => this.dependencies.drafter.draftEvents(source), eventDraftRows);
  }
}
