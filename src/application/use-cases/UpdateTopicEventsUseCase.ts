import { type HistoricalEvent, HistoricalEventSchema } from "@/domain/entities/HistoricalEvent";
import { success, type Result } from "@/shared/Result";
import { UpdateTopicEventsInputSchema } from "../dto/TopicEditorInputs";
import type { HistoricalEventRepository } from "../ports/HistoricalEventRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import {
  keepOwnId,
  loadTopicToEdit,
  type TopicEditingDependencies,
  type TopicEditingError,
  validateTopicList,
} from "./topicEditing";

// The topic's timeline, saved as a whole list. Each event takes the topic and its civilization from the
// server; the page sorts them by date, so the order of the list does not matter.
export class UpdateTopicEventsUseCase {
  constructor(
    private readonly dependencies: TopicEditingDependencies & { events: HistoricalEventRepository; ids: IdGenerator },
  ) {}

  async execute(input: unknown): Promise<Result<HistoricalEvent[], TopicEditingError>> {
    const loaded = await loadTopicToEdit(this.dependencies, UpdateTopicEventsInputSchema, input);
    if (!loaded.success) return loaded;

    const { topic, data } = loaded.data;
    const { events, ids } = this.dependencies;
    const idFor = keepOwnId(new Set((await events.listByTopic(topic.id)).map((event) => event.id)), ids);

    const validated = validateTopicList(
      HistoricalEventSchema,
      data.events.map((row) => ({ ...row, id: idFor(row.id), topicId: topic.id, era: topic.era })),
      "events",
    );
    if (!validated.success) return validated;

    await events.replaceForTopic(topic.id, validated.data);
    return success(validated.data);
  }
}
