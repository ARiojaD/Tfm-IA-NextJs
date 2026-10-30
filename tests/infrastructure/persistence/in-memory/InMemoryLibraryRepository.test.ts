import { InMemoryLibraryRepository } from "@/infrastructure/persistence/in-memory/InMemoryLibraryRepository";
import { describeLibraryRepositoryContract } from "../../../application/ports/LibraryRepository.contract";

describeLibraryRepositoryContract("InMemoryLibraryRepository", () => new InMemoryLibraryRepository());
