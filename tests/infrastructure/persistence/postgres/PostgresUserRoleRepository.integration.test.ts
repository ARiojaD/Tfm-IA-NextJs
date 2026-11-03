import { describe, expect, it } from "vitest";
import { PostgresUserRoleRepository } from "@/infrastructure/persistence/postgres/PostgresUserRoleRepository";
import { describeUserRoleRepositoryContract } from "../../../application/ports/UserRoleRepository.contract";
import { resetDatabase, testDb } from "./testDatabase";

describeUserRoleRepositoryContract("PostgresUserRoleRepository", async () => {
  await resetDatabase();
  return new PostgresUserRoleRepository(testDb);
});

describe("PostgresUserRoleRepository.findUserIdByEmail (para el script admin:grant)", () => {
  it("encuentra la cuenta por su email", async () => {
    await resetDatabase();

    expect(await new PostgresUserRoleRepository(testDb).findUserIdByEmail("user-1@example.com")).toBe("user-1");
  });

  it("devuelve null si no hay ninguna cuenta con ese email", async () => {
    await resetDatabase();

    expect(await new PostgresUserRoleRepository(testDb).findUserIdByEmail("nadie@example.com")).toBeNull();
  });
});
