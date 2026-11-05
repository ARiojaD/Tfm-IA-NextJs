import { existsSync } from "node:fs";
import { RebuildKnowledgeIndexUseCase } from "@/application/use-cases/RebuildKnowledgeIndexUseCase";
import { RefreshTopicIndexUseCase } from "@/application/use-cases/RefreshTopicIndexUseCase";
import { parseDatabaseEnv } from "@/composition/env";
import { TransformersEmbeddingService } from "@/infrastructure/ai/TransformersEmbeddingService";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { PostgresHistoricalEventRepository } from "@/infrastructure/persistence/postgres/PostgresHistoricalEventRepository";
import { PostgresKnowledgeIndex } from "@/infrastructure/persistence/postgres/PostgresKnowledgeIndex";
import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";

// npm run rag:index — rebuilds the RAG index of every published topic (drafts are left out). The panel
// keeps it up to date on its own; this is for after `npm run db:seed`, after changing the embedding model,
// or if an automatic refresh failed. Safe to run again: each topic's fragments are replaced, never doubled.
async function main() {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const { db, close } = createDatabase(parseDatabaseEnv(process.env).DATABASE_URL, { maxConnections: 1 });

  try {
    const topicEditor = new PostgresTopicRepository(db);
    const refresh = new RefreshTopicIndexUseCase({
      topicEditor,
      events: new PostgresHistoricalEventRepository(db),
      embeddings: new TransformersEmbeddingService(),
      index: new PostgresKnowledgeIndex(db),
    });

    console.log("Indexando los temas publicados (la primera vez se descarga el modelo de embeddings)…");
    const { indexedTopics, removedTopics, chunks } = await new RebuildKnowledgeIndexUseCase({ topicEditor, refresh }).execute();
    console.log(`Índice del RAG listo: ${indexedTopics} temas publicados, ${chunks} fragmentos. Borradores fuera del índice: ${removedTopics}.`);
  } finally {
    await close();
  }
}

main().catch((error: unknown) => {
  // Only the message: a driver error could otherwise print connection details.
  console.error(`No se pudo crear el índice del RAG: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
