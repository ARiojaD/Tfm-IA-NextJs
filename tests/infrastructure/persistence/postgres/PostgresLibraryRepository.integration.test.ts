import { PostgresLibraryRepository } from "@/infrastructure/persistence/postgres/PostgresLibraryRepository";
import { describeLibraryRepositoryContract } from "../../../application/ports/LibraryRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeLibraryRepositoryContract("PostgresLibraryRepository", async () => {
  await resetDatabase();
  return new PostgresLibraryRepository(testDb);
});
