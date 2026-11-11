import { z } from "zod";
import { type EntityId, EntityIdSchema } from "@/domain/value-objects/EntityId";
import type { Result } from "@/shared/Result";
import type { RefreshTopicIndexUseCase } from "./RefreshTopicIndexUseCase";

interface UseCase<Output, Failure extends Error> {
  execute(input: unknown): Promise<Result<Output, Failure>>;
}

const TopicIdInputSchema = z.object({ topicId: EntityIdSchema });

// Tras una edición correcta el caso de uso ya validó su entrada, así que su `topicId` es de fiar.
function topicIdOfInput(input: unknown): EntityId | undefined {
  return TopicIdInputSchema.safeParse(input).data?.topicId;
}

// Envuelve un caso de uso de administración que cambia lo que indexa el RAG (título, resumen,
// introducción, datos clave, cronología, estado), para que el índice siga cada edición sin que el caso de
// uso sepa que existe (patrón decorator). La edición ya está guardada cuando se actualiza el índice: si
// eso falla (no se pudo cargar el modelo), el administrador conserva su edición; el fallo se registra y
// `npm run rag:index` deja el índice bien.
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
