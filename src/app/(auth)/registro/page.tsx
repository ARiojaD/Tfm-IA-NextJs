import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getContainer } from "@/composition/container";
import { safeRedirectPath } from "@/lib/safeRedirectPath";
import { registerUser } from "../actions";

export const metadata: Metadata = { title: "Crear cuenta · MemnonHistory AI" };

export default async function RegisterPage({ searchParams }: PageProps<"/registro">) {
  const volver = safeRedirectPath((await searchParams).volver);
  if (await getContainer().getCurrentUser.execute()) {
    redirect(volver);
  }

  return (
    <AuthPageLayout title="Crear una cuenta" text="Únete para comentar los temas y, muy pronto, guardar tus favoritos.">
      <RegisterForm action={registerUser} volver={volver} />
      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link
          href={`/iniciar-sesion?volver=${encodeURIComponent(volver)}`}
          className="font-medium text-accent hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </AuthPageLayout>
  );
}
