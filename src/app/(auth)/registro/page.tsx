import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getContainer } from "@/composition/container";
import { safeRedirectPath } from "@/lib/safeRedirectPath";
import { registerUser } from "../actions";

export const metadata: Metadata = { title: "Crear cuenta · MemnonHistory AI" };

// Lo que aporta tener cuenta, para que la página de registro responda a «¿para qué registrarme?».
const ACCOUNT_BENEFITS = [
  "Seguir civilizaciones y tener todos sus temas, también los nuevos, en Mi biblioteca",
  "Guardar los temas que más te interesen",
  "Comentar y conversar con otros lectores",
];

export default async function RegisterPage({ searchParams }: PageProps<"/registro">) {
  const volver = safeRedirectPath((await searchParams).volver);
  if (await getContainer().getCurrentUser.execute()) {
    redirect(volver);
  }

  return (
    <AuthPageLayout title="Crear una cuenta" text="Es gratis. Con tu cuenta podrás:">
      <ul className="-mt-4 mb-8 space-y-2 text-sm">
        {ACCOUNT_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <span aria-hidden="true" className="text-accent">✓</span>
            {benefit}
          </li>
        ))}
      </ul>
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
