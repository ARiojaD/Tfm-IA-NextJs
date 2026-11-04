import { PostgresProposalRepository } from "@/infrastructure/persistence/postgres/PostgresProposalRepository";
import { describeProposalRepositoryContract } from "../../../application/ports/ProposalRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeProposalRepositoryContract("PostgresProposalRepository", async () => {
  await resetDatabase();
  return new PostgresProposalRepository(testDb);
});
