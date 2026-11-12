import { InMemoryTimelineMilestoneRepository } from "@/infrastructure/persistence/in-memory/InMemoryTimelineMilestoneRepository";
import { describeTimelineMilestoneRepositoryContract } from "../../../application/ports/TimelineMilestoneRepository.contract";

describeTimelineMilestoneRepositoryContract(
  "InMemoryTimelineMilestoneRepository",
  (milestones) => new InMemoryTimelineMilestoneRepository(milestones),
);
