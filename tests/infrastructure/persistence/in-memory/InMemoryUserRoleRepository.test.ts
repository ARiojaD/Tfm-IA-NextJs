import { InMemoryUserRoleRepository } from "@/infrastructure/persistence/in-memory/InMemoryUserRoleRepository";
import { describeUserRoleRepositoryContract } from "../../../application/ports/UserRoleRepository.contract";

describeUserRoleRepositoryContract("InMemoryUserRoleRepository", () => new InMemoryUserRoleRepository());
