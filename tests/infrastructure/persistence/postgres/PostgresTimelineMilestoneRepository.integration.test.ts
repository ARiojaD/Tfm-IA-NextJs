import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { PostgresTimelineMilestoneRepository } from "@/infrastructure/persistence/postgres/PostgresTimelineMilestoneRepository";
import { topics } from "@/infrastructure/persistence/postgres/schema";
import { describeTimelineMilestoneRepositoryContract } from "../../../application/ports/TimelineMilestoneRepository.contract";
import { aMilestone } from "../../../fixtures/timeline";
import { resetDatabase, testDb } from "./testDatabase";

describeTimelineMilestoneRepositoryContract("PostgresTimelineMilestoneRepository", async (milestones) => {
  await resetDatabase({ milestones });
  return new PostgresTimelineMilestoneRepository(testDb);
});

describe("PostgresTimelineMilestoneRepository y los temas", () => {
  it("borrar el tema enlazado deja el hito en la cronología, sin enlace", async () => {
    const withoutLink = aMilestone({ id: "milestone-rubicon", title: "César cruza el Rubicón" });
    await resetDatabase({ milestones: [{ ...withoutLink, topicId: "topic-caesar" }] });
    const repository = new PostgresTimelineMilestoneRepository(testDb);

    await testDb.delete(topics).where(eq(topics.id, "topic-caesar"));

    expect(await repository.listByEra("ROMAN")).toEqual([withoutLink]);
  });

  it("rechaza un hito enlazado a un tema que no existe", async () => {
    await resetDatabase();
    const repository = new PostgresTimelineMilestoneRepository(testDb);

    await expect(
      repository.replaceForEra("ROMAN", [aMilestone({ topicId: "topic-does-not-exist" })]),
    ).rejects.toThrow();
  });
});
