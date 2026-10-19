import { InMemoryQuizRepository } from "@/infrastructure/persistence/in-memory/InMemoryQuizRepository";
import { describeQuizRepositoryContract } from "../../../application/ports/QuizRepository.contract";

describeQuizRepositoryContract("InMemoryQuizRepository", (quizzes) => new InMemoryQuizRepository(quizzes));
