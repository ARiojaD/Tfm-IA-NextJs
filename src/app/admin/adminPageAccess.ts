import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AdminAuthorizationError } from "@/application/use-cases/authorizeAdmin";
import { getContainer } from "@/composition/container";

// What an admin page answers when its use case refuses access: an anonymous visitor goes to sign in (and
// back); a signed-in non-admin gets a plain 404, so the panel does not even admit it exists. A topic id
// that does not exist is a 404 too.
export function denyAdminPage(error: AdminAuthorizationError | TopicNotFoundError, path: string): never {
  if (error instanceof AuthenticationRequiredError) {
    redirect(`/iniciar-sesion?volver=${encodeURIComponent(path)}`);
  }
  notFound();
}

// The title also depends on access: a fixed one would show the panel's titles in the tab of the 404 that
// non-admins get, revealing that the panel exists. Admin pages are never indexed.
export async function adminPageMetadata(title: string): Promise<Metadata> {
  const access = await getContainer().getAdminAccess.execute();

  return {
    title: access.success ? `${title} · MemnonHistory AI` : "Página no encontrada · MemnonHistory AI",
    robots: { index: false, follow: false },
  };
}
