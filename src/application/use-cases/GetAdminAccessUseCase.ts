import type { Result } from "@/shared/Result";
import type { AuthenticatedUser } from "../ports/AuthService";
import { type AdminAuthorizationDependencies, type AdminAuthorizationError, authorizeAdmin } from "./authorizeAdmin";

// Lets the admin pages decide what to show: the panel, the sign-in page or a 404 for non-admins.
// The admin use cases still check on their own; this is not the protection, only the page's answer.
export class GetAdminAccessUseCase {
  constructor(private readonly dependencies: AdminAuthorizationDependencies) {}

  execute(): Promise<Result<AuthenticatedUser, AdminAuthorizationError>> {
    return authorizeAdmin(this.dependencies);
  }
}
