import { PostgresCommentRepository } from "@/infrastructure/persistence/postgres/PostgresCommentRepository";
import { describeCommentRepositoryContract } from "../../../application/ports/CommentRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeCommentRepositoryContract("PostgresCommentRepository", async (comments) => {
  await resetDatabase({ comments });
  return new PostgresCommentRepository(testDb);
});
