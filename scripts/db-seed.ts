import { existsSync } from "node:fs";
import { parseDatabaseEnv } from "@/composition/env";
import { SEED } from "@/infrastructure/persistence/in-memory/seed";
import { createDatabase } from "@/infrastructure/persistence/postgres/client";
import { insertSeed } from "@/infrastructure/persistence/postgres/insertSeed";

// npm run db:seed — carga los temas de ejemplo (Julio César, Asedio de Alesia…) en la base de datos de
// `DATABASE_URL`. Es el mismo `SEED` que usan los repositorios en memoria, así que los dos son idénticos.
// Las filas que ya existen se saltan: se puede volver a ejecutar sin peligro y nunca borra nada.
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
  // Solo el mensaje: un error del driver podría mostrar los datos de conexión.
  console.error(`No se pudo cargar el seed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
