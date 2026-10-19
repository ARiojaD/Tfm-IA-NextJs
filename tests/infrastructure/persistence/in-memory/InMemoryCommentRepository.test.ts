import { InMemoryCommentRepository } from "@/infrastructure/persistence/in-memory/InMemoryCommentRepository";
import { describeCommentRepositoryContract } from "../../../application/ports/CommentRepository.contract";

describeCommentRepositoryContract("InMemoryCommentRepository", (comments) => new InMemoryCommentRepository(comments));
