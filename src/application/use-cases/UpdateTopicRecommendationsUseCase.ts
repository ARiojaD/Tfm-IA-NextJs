import { type Recommendation, RecommendationSchema } from "@/domain/entities/Recommendation";
import { success, type Result } from "@/shared/Result";
import { UpdateTopicRecommendationsInputSchema } from "../dto/TopicEditorInputs";
import type { IdGenerator } from "../ports/IdGenerator";
import type { RecommendationRepository } from "../ports/RecommendationRepository";
import {
  keepOwnId,
  loadTopicToEdit,
  type TopicEditingDependencies,
  type TopicEditingError,
  validateTopicList,
} from "./topicEditing";

// The topic's books, films and series, saved as a whole list (the page groups them by type).
export class UpdateTopicRecommendationsUseCase {
  constructor(
    private readonly dependencies: TopicEditingDependencies & { recommendations: RecommendationRepository; ids: IdGenerator },
  ) {}

  async execute(input: unknown): Promise<Result<Recommendation[], TopicEditingError>> {
    const loaded = await loadTopicToEdit(this.dependencies, UpdateTopicRecommendationsInputSchema, input);
    if (!loaded.success) return loaded;

    const { topic, data } = loaded.data;
    const { recommendations, ids } = this.dependencies;
    const idFor = keepOwnId(new Set((await recommendations.listByTopic(topic.id)).map((item) => item.id)), ids);

    const validated = validateTopicList(
      RecommendationSchema,
      data.recommendations.map((row) => ({ ...row, id: idFor(row.id), topicId: topic.id })),
      "recommendations",
    );
    if (!validated.success) return validated;

    await recommendations.replaceForTopic(topic.id, validated.data);
    return success(validated.data);
  }
}
