import { PostgresRecommendationRepository } from "@/infrastructure/persistence/postgres/PostgresRecommendationRepository";
import { describeRecommendationRepositoryContract } from "../../../application/ports/RecommendationRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeRecommendationRepositoryContract("PostgresRecommendationRepository", async (recommendations) => {
  await resetDatabase({ recommendations });
  return new PostgresRecommendationRepository(testDb);
});
