import { PostgresQuizRepository } from "@/infrastructure/persistence/postgres/PostgresQuizRepository";
import { describeQuizRepositoryContract } from "../../../application/ports/QuizRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeQuizRepositoryContract("PostgresQuizRepository", async (quizzes) => {
  await resetDatabase({ quizzes });
  return new PostgresQuizRepository(testDb);
});
