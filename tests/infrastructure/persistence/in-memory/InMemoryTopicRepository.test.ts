import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { describeTopicRepositoryContract } from "../../../application/ports/TopicRepository.contract";

describeTopicRepositoryContract("InMemoryTopicRepository", (topics) => new InMemoryTopicRepository(topics));
