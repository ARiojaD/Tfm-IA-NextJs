import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SignInForm } from "@/components/auth/SignInForm";
import { getContainer } from "@/composition/container";
import { safeRedirectPath } from "@/lib/safeRedirectPath";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Iniciar sesión · MemnonHistory AI" };

export default async function SignInPage({ searchParams }: PageProps<"/iniciar-sesion">) {
  const volver = safeRedirectPath((await searchParams).volver);
  if (await getContainer().getCurrentUser.execute()) {
    redirect(volver);
  }

  return (
    <AuthPageLayout title="Iniciar sesión" text="Entra para comentar y, muy pronto, guardar tus temas favoritos.">
      <SignInForm action={signIn} volver={volver} />
      <p className="mt-6 text-center text-sm text-muted">
        ¿Todavía no tienes cuenta?{" "}
        <Link href={`/registro?volver=${encodeURIComponent(volver)}`} className="font-medium text-accent hover:underline">
          Crear una cuenta
        </Link>
      </p>
    </AuthPageLayout>
  );
}
