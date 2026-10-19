import { InMemoryRecommendationRepository } from "@/infrastructure/persistence/in-memory/InMemoryRecommendationRepository";
import { describeRecommendationRepositoryContract } from "../../../application/ports/RecommendationRepository.contract";

describeRecommendationRepositoryContract("InMemoryRecommendationRepository", (recommendations) => new InMemoryRecommendationRepository(recommendations));
