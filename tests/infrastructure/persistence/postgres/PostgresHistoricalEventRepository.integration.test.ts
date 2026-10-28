import { PostgresHistoricalEventRepository } from "@/infrastructure/persistence/postgres/PostgresHistoricalEventRepository";
import { describeHistoricalEventRepositoryContract } from "../../../application/ports/HistoricalEventRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeHistoricalEventRepositoryContract("PostgresHistoricalEventRepository", async (events) => {
  await resetDatabase({ events });
  return new PostgresHistoricalEventRepository(testDb);
});
