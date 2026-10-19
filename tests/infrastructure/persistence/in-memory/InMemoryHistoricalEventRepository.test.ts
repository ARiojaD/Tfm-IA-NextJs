import { InMemoryHistoricalEventRepository } from "@/infrastructure/persistence/in-memory/InMemoryHistoricalEventRepository";
import { describeHistoricalEventRepositoryContract } from "../../../application/ports/HistoricalEventRepository.contract";

describeHistoricalEventRepositoryContract("InMemoryHistoricalEventRepository", (events) => new InMemoryHistoricalEventRepository(events));
