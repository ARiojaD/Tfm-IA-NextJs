import { type EventDraftRow, eventDraftRows } from "@/domain/entities/TopicDrafts";
import type { Result } from "@/shared/Result";
import { draftFromTopic, type TopicDraftingDependencies, type TopicDraftingError } from "./topicDrafting";

// The AI proposes a timeline from the topic's text. It only fills the form: saving is the administrator's.
export class DraftTopicEventsUseCase {
  constructor(private readonly dependencies: TopicDraftingDependencies) {}

  execute(input: unknown): Promise<Result<EventDraftRow[], TopicDraftingError>> {
    return draftFromTopic(this.dependencies, input, (source) => this.dependencies.drafter.draftEvents(source), eventDraftRows);
  }
}
