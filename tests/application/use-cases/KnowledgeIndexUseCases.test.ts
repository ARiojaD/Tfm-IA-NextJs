import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmbeddingService } from "@/application/ports/EmbeddingService";
import { RebuildKnowledgeIndexUseCase } from "@/application/use-cases/RebuildKnowledgeIndexUseCase";
import { refreshingTopicIndex } from "@/application/use-cases/refreshingTopicIndex";
import { RefreshTopicIndexUseCase } from "@/application/use-cases/RefreshTopicIndexUseCase";
import { chunkEmbeddingText } from "@/domain/entities/KnowledgeChunk";
import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { InMemoryKnowledgeIndex } from "@/infrastructure/persistence/in-memory/InMemoryKnowledgeIndex";
import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { failure, success } from "@/shared/Result";
import { anEvent, aTopic } from "../../fixtures/historicalTopics";

const caesar = aTopic({
  id: "topic-caesar",
  title: "Julio César",
  introduction: ["Conquistó las Galias."],
  keyFacts: [{ label: "Nacimiento", value: "100 a.C." }],
});
const pericles = aTopic({ id: "topic-pericles", slug: "pericles", title: "Pericles" });
const viriato = aTopic({ id: "topic-viriato", slug: "viriato", title: "Viriato", status: "DRAFT" });
const rubicon = anEvent({ id: "event-rubicon", topicId: "topic-caesar", title: "Cruce del Rubicón" });

// Every text gets the same vector: these tests check what is indexed, not how similar it is.
class RecordingEmbeddings implements EmbeddingService {
  readonly batches: string[][] = [];

  embedDocuments(texts: string[]): Promise<number[][]> {
    this.batches.push(texts);
    return Promise.resolve(texts.map(() => [1, 0]));
  }

  embedQuery(): Promise<number[]> {
    return Promise.resolve([1, 0]);
  }
}

describe("Índice del RAG", () => {
  let topics: InMemoryTopicRepository;
  let events: InMemoryHistoricalEventRepository;
  let index: InMemoryKnowledgeIndex;
  let embeddings: RecordingEmbeddings;
  let refresh: RefreshTopicIndexUseCase;

  const indexedTopicIds = async () =>
    [...new Set((await index.search([1, 0], 100)).map((match) => match.chunk.topicId))].sort();

  beforeEach(() => {
    topics = new InMemoryTopicRepository([caesar, pericles, viriato]);
    events = new InMemoryHistoricalEventRepository([rubicon]);
    index = new InMemoryKnowledgeIndex();
    embeddings = new RecordingEmbeddings();
    refresh = new RefreshTopicIndexUseCase({ topicEditor: topics, events, embeddings, index });
  });

  describe("RefreshTopicIndexUseCase", () => {
    it("indexa la introducción, los datos clave y la cronología de un tema publicado", async () => {
      const result = await refresh.execute("topic-caesar");

      expect(result).toEqual({ indexed: true, chunks: 3 });
      const chunks = (await index.search([1, 0], 10)).map((match) => match.chunk);
      expect(chunks.map((chunk) => chunk.source).sort()).toEqual(["EVENT", "INTRODUCTION", "KEY_FACT"]);
    });

    it("convierte en vectores el texto con el título y el resumen del tema, en un solo lote", async () => {
      await refresh.execute("topic-caesar");

      expect(embeddings.batches).toHaveLength(1);
      expect(embeddings.batches[0][0]).toBe(
        chunkEmbeddingText(caesar, { topicId: "topic-caesar", source: "INTRODUCTION", position: 0, content: "Conquistó las Galias." }),
      );
    });

    it("al reindexar sustituye los fragmentos anteriores del tema", async () => {
      await refresh.execute("topic-caesar");
      await events.replaceForTopic("topic-caesar", []);

      await refresh.execute("topic-caesar");

      const chunks = (await index.search([1, 0], 10)).map((match) => match.chunk);
      expect(chunks.some((chunk) => chunk.source === "EVENT")).toBe(false);
    });

    it("un borrador no se indexa, y si estaba indexado sale del índice", async () => {
      await refresh.execute("topic-caesar");
      await topics.save({ ...caesar, status: "DRAFT" });

      const result = await refresh.execute("topic-caesar");

      expect(result).toEqual({ indexed: false, chunks: 0 });
      expect(await indexedTopicIds()).toEqual([]);
      expect(embeddings.batches).toHaveLength(1);
    });

    it("un tema borrado sale del índice", async () => {
      await refresh.execute("topic-caesar");
      await topics.delete("topic-caesar");

      expect(await refresh.execute("topic-caesar")).toEqual({ indexed: false, chunks: 0 });
      expect(await indexedTopicIds()).toEqual([]);
    });

    it("falla si el servicio de embeddings no devuelve un vector por fragmento", async () => {
      vi.spyOn(embeddings, "embedDocuments").mockResolvedValue([[1, 0]]);

      await expect(refresh.execute("topic-caesar")).rejects.toThrow(/vector/);
      expect(await indexedTopicIds()).toEqual([]);
    });
  });

  describe("RebuildKnowledgeIndexUseCase", () => {
    it("indexa todos los temas publicados y deja fuera los borradores", async () => {
      await index.replaceTopic("topic-viriato", [
        { chunk: { topicId: "topic-viriato", source: "INTRODUCTION", position: 0, content: "Viejo." }, embedding: [1, 0] },
      ]);

      const summary = await new RebuildKnowledgeIndexUseCase({ topicEditor: topics, refresh }).execute();

      expect(summary).toEqual({ indexedTopics: 2, removedTopics: 1, chunks: 5 });
      expect(await indexedTopicIds()).toEqual(["topic-caesar", "topic-pericles"]);
    });
  });

  describe("refreshingTopicIndex", () => {
    const editTopic = { execute: vi.fn() };
    const onFailure = vi.fn();

    beforeEach(() => {
      editTopic.execute.mockReset();
      onFailure.mockReset();
    });

    it("tras una edición correcta reindexa el tema de la entrada", async () => {
      editTopic.execute.mockResolvedValue(success({ id: "topic-caesar" }));
      const edit = refreshingTopicIndex(editTopic, refresh, { onFailure });

      const result = await edit.execute({ topicId: "topic-caesar", title: "Julio César" });

      expect(result).toEqual(success({ id: "topic-caesar" }));
      expect(await indexedTopicIds()).toEqual(["topic-caesar"]);
    });

    it("si la edición falla no reindexa nada", async () => {
      editTopic.execute.mockResolvedValue(failure(new Error("No válido")));
      const edit = refreshingTopicIndex(editTopic, refresh, { onFailure });

      await edit.execute({ topicId: "topic-caesar" });

      expect(embeddings.batches).toEqual([]);
    });

    it("si reindexar falla, la edición sigue siendo correcta y se avisa del fallo", async () => {
      editTopic.execute.mockResolvedValue(success(undefined));
      const broken = new Error("El modelo no está disponible");
      vi.spyOn(embeddings, "embedDocuments").mockRejectedValue(broken);
      const edit = refreshingTopicIndex(editTopic, refresh, { onFailure });

      const result = await edit.execute({ topicId: "topic-caesar" });

      expect(result).toEqual(success(undefined));
      expect(onFailure).toHaveBeenCalledWith("topic-caesar", broken);
    });

    it("el tema puede salir del resultado en lugar de la entrada", async () => {
      editTopic.execute.mockResolvedValue(success({ proposal: { topicId: "topic-caesar" } }));
      const edit = refreshingTopicIndex(editTopic, refresh, {
        onFailure,
        topicIdOf: (_input, output: { proposal: { topicId: string } }) => output.proposal.topicId,
      });

      await edit.execute({ proposalId: "proposal-1" });

      expect(await indexedTopicIds()).toEqual(["topic-caesar"]);
    });

    it("sin tema no reindexa nada", async () => {
      editTopic.execute.mockResolvedValue(success(undefined));
      const edit = refreshingTopicIndex(editTopic, refresh, { onFailure });

      await edit.execute({ topicId: 42 });

      expect(embeddings.batches).toEqual([]);
      expect(onFailure).not.toHaveBeenCalled();
    });
  });
});
