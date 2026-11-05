import { z } from "zod";
import { type EntityId, EntityIdSchema } from "@/domain/value-objects/EntityId";
import type { Result } from "@/shared/Result";
import type { RefreshTopicIndexUseCase } from "./RefreshTopicIndexUseCase";

interface UseCase<Output, Failure extends Error> {
  execute(input: unknown): Promise<Result<Output, Failure>>;
}

const TopicIdInputSchema = z.object({ topicId: EntityIdSchema });

// After a successful edit the use case has already validated its input, so its topicId is trustworthy.
function topicIdOfInput(input: unknown): EntityId | undefined {
  return TopicIdInputSchema.safeParse(input).data?.topicId;
}

// Wraps an admin use case that changes what the RAG indexes (title, summary, introduction, key facts,
// timeline, status), so the index follows every edit without the use case knowing it exists.
// The edit is already saved when the refresh runs: if the refresh fails (the model could not load), the
// admin still gets their edit; the failure is reported and `npm run rag:index` puts the index right.
export function refreshingTopicIndex<Output, Failure extends Error>(
  useCase: UseCase<Output, Failure>,
  refresh: Pick<RefreshTopicIndexUseCase, "execute">,
  options: {
    onFailure: (topicId: EntityId, error: unknown) => void;
    topicIdOf?: (input: unknown, output: Output) => EntityId | undefined;
  },
): UseCase<Output, Failure> {
  const topicIdOf = options.topicIdOf ?? topicIdOfInput;

  return {
    async execute(input) {
      const result = await useCase.execute(input);
      if (!result.success) return result;

      const topicId = topicIdOf(input, result.data);
      if (topicId !== undefined) {
        try {
          await refresh.execute(topicId);
        } catch (error) {
          options.onFailure(topicId, error);
        }
      }
      return result;
    },
  };
}
