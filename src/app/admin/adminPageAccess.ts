import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AuthenticationRequiredError } from "@/application/errors/AuthenticationRequiredError";
import { TopicNotFoundError } from "@/application/errors/TopicNotFoundError";
import type { AdminAuthorizationError } from "@/application/use-cases/authorizeAdmin";
import { getContainer } from "@/composition/container";

// Lo que responde una página de administración cuando su caso de uso niega el acceso: un visitante anónimo
// va a iniciar sesión (y vuelve); un usuario con sesión que no es administrador recibe un 404 normal, para
// que el panel ni siquiera admita que existe. Un id de tema que no existe también es un 404.
export function denyAdminPage(error: AdminAuthorizationError | TopicNotFoundError, path: string): never {
  if (error instanceof AuthenticationRequiredError) {
    redirect(`/iniciar-sesion?volver=${encodeURIComponent(path)}`);
  }
  notFound();
}

// El título también depende del acceso: uno fijo mostraría los títulos del panel en la pestaña del 404 que
// reciben quienes no son administradores, revelando que el panel existe. Las páginas de administración
// nunca se indexan.
export async function adminPageMetadata(title: string): Promise<Metadata> {
  const access = await getContainer().getAdminAccess.execute();

  return {
    title: access.success ? `${title} · MemnonHistory AI` : "Página no encontrada · MemnonHistory AI",
    robots: { index: false, follow: false },
  };
}
