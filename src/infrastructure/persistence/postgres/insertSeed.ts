import type { Seed } from "../in-memory/seed";
import type { Database } from "./client";
import {
  toCommentRow,
  toEventRow,
  toQuizRows,
  toMilestoneRow,
  toRecommendationRow,
  toTopicRow,
} from "./mappers";
import {
  comments,
  historicalEvents,
  quizQuestions,
  quizzes,
  recommendations,
  timelineMilestones,
  topicRelations,
  topics,
} from "./schema";

// Carga el seed en PostgreSQL en una sola transacción (todo o nada), los padres antes que los hijos para
// que se cumplan las claves foráneas. Las filas que ya existen se saltan, así que se puede ejecutar más de
// una vez.
export async function insertSeed(db: Database, seed: Partial<Seed>) {
  const quizRows = (seed.quizzes ?? []).map(toQuizRows);
  const relationRows = (seed.topics ?? []).flatMap((topic) =>
    topic.relatedTopicIds.map((relatedTopicId) => ({ topicId: topic.id, relatedTopicId })),
  );

  await db.transaction(async (tx) => {
    const insertAll = async <Row extends object>(
      table: Parameters<typeof tx.insert>[0],
      rows: Row[],
    ): Promise<void> => {
      if (rows.length > 0) {
        await tx.insert(table).values(rows).onConflictDoNothing();
      }
    };

    await insertAll(topics, (seed.topics ?? []).map(toTopicRow));
    await insertAll(topicRelations, relationRows);
    await insertAll(historicalEvents, (seed.events ?? []).map(toEventRow));
    await insertAll(quizzes, quizRows.map((rows) => rows.quiz));
    await insertAll(quizQuestions, quizRows.flatMap((rows) => rows.questions));
    await insertAll(comments, (seed.comments ?? []).map(toCommentRow));
    await insertAll(recommendations, (seed.recommendations ?? []).map(toRecommendationRow));
    await insertAll(timelineMilestones, (seed.milestones ?? []).map(toMilestoneRow));
  });
}
