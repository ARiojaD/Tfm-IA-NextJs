import { InMemoryProposalRepository } from "@/infrastructure/persistence/in-memory/InMemoryProposalRepository";
import { describeProposalRepositoryContract } from "../../../application/ports/ProposalRepository.contract";

describeProposalRepositoryContract("InMemoryProposalRepository", () => new InMemoryProposalRepository());
