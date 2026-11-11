import { existsSync } from "node:fs";
import { RebuildKnowledgeIndexUseCase } from "@/application/use-cases/RebuildKnowledgeIndexUseCase";
import { RefreshTopicIndexUseCase } from "@/application/use-cases/RefreshTopicIndexUseCase";
import { parseDatabaseEnv } from "@/composition/env";
import { TransformersEmbeddingService } from "@/infrastructure/ai/TransformersEmbeddingService";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { PostgresHistoricalEventRepository } from "@/infrastructure/persistence/postgres/PostgresHistoricalEventRepository";
import { PostgresKnowledgeIndex } from "@/infrastructure/persistence/postgres/PostgresKnowledgeIndex";
import { PostgresTopicRepository } from "@/infrastructure/persistence/postgres/PostgresTopicRepository";

// npm run rag:index — reconstruye el índice del RAG con todos los temas publicados (los borradores se
// quedan fuera). El panel lo mantiene al día solo; esto es para después de `npm run db:seed`, después de
// cambiar el modelo de embeddings o si falló una actualización automática. Se puede volver a ejecutar sin
// peligro: los fragmentos de cada tema se sustituyen, nunca se duplican.
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
  // Solo el mensaje: un error del driver podría mostrar los datos de conexión.
  console.error(`No se pudo crear el índice del RAG: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
