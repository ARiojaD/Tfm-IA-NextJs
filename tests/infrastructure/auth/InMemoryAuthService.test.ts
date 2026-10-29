import { InMemoryAuthService } from "@/infrastructure/auth/InMemoryAuthService";
import { describeAuthServiceContract } from "../../application/ports/AuthService.contract";

describeAuthServiceContract("InMemoryAuthService", () => new InMemoryAuthService());
