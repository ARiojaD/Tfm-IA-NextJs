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

// La cronología del tema, guardada como una lista completa. Cada evento toma del servidor el tema y su
// civilización; la página los ordena por fecha, así que el orden de la lista no importa.
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
