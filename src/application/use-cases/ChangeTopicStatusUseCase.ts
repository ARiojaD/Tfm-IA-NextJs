import type { HistoricalTopic } from "@/domain/entities/HistoricalTopic";
import { failure, type Result } from "@/shared/Result";
import { ChangeTopicStatusInputSchema } from "../dto/TopicEditorInputs";
import { InvalidTopicError } from "../errors/InvalidTopicError";
import { editTopic, type TopicEditingDependencies, type TopicEditingError } from "./topicEditing";

// Publish (the topic appears on the web) or unpublish (back to draft: hidden, but nothing is lost).
// Publishing an incomplete topic fails with the list of what is missing, from the domain rules.
export class ChangeTopicStatusUseCase {
  constructor(private readonly dependencies: TopicEditingDependencies) {}

  async execute(input: unknown): Promise<Result<HistoricalTopic, TopicEditingError>> {
    const result = await editTopic(this.dependencies, ChangeTopicStatusInputSchema, input, (topic, { status }) => ({
      ...topic,
      status,
    }));

    // Shown next to the "Publicar" button, not next to the fields of other sections.
    if (!result.success && result.error instanceof InvalidTopicError) {
      const { fieldErrors, formErrors } = result.error;
      return failure(new InvalidTopicError({}, [...formErrors, ...Object.values(fieldErrors).flat()]));
    }
    return result;
  }
}
