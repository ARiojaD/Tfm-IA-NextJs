import { InMemoryTopicRepository } from "@/infrastructure/persistence/in-memory/InMemoryTopicRepository";
import { describeTopicEditorRepositoryContract } from "../../../application/ports/TopicEditorRepository.contract";

describeTopicEditorRepositoryContract("InMemoryTopicRepository", (topics) => new InMemoryTopicRepository(topics));
