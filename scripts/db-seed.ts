import { existsSync } from "node:fs";
import { parseDatabaseEnv } from "@/composition/env";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";

// npm run db:seed — loads the example topics (Julio César, Asedio de Alesia…) into the database in
// DATABASE_URL. The same SEED the in-memory repositories use, so both stay identical. Existing rows are
// skipped, so it is safe to run again; it never deletes anything.
async function main() {
  if (existsSync(".env.local")) {
    process.loadEnvFile(".env.local");
  }
  const { db, close } = createDatabase(parseDatabaseEnv(process.env).DATABASE_URL, { maxConnections: 1 });

  try {
    await insertSeed(db, SEED);
    console.log(
      `Seed cargado: ${SEED.topics.length} temas, ${SEED.events.length} eventos, ${SEED.quizzes.length} quizzes, ` +
        `${SEED.comments.length} comentarios y ${SEED.recommendations.length} recomendaciones.`,
    );
  } finally {
    await close();
  }
}

main().catch((error: unknown) => {
  // Only the message: a driver error could otherwise print connection details.
  console.error(`No se pudo cargar el seed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
