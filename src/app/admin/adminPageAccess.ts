import { notFound, redirect } from "next/navigation";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import type { AdminAuthorizationError } from "@/application/use-cases/authorizeAdmin";

// What an admin page answers when its use case refuses access: an anonymous visitor goes to sign in (and
// back); a signed-in non-admin gets a plain 404, so the panel does not even admit it exists.
export function denyAdminPage(error: AdminAuthorizationError, path: string): never {
  if (error instanceof AuthenticationRequiredError) {
    redirect(`/iniciar-sesion?volver=${encodeURIComponent(path)}`);
  }
  notFound();
}
