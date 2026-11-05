import { InMemoryKnowledgeIndex } from "@/infrastructure/persistence/in-memory/InMemoryKnowledgeIndex";
import { describeKnowledgeIndexContract } from "../../../application/ports/KnowledgeIndex.contract";

describeKnowledgeIndexContract("InMemoryKnowledgeIndex", () => new InMemoryKnowledgeIndex(), 8);
