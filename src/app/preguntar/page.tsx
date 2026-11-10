import type { Metadata } from "next";
import { AskForm } from "@/components/ask/AskForm";
import { SignInToSave } from "@/components/library/SignInToSave";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import { askEncyclopedia } from "./actions";

export const metadata: Metadata = { title: "Preguntar · MemnonHistory AI" };

// Asking needs an account (the use case enforces it): visitors see what it is and how to get in.
export default async function AskPage() {
  const user = await getContainer().getCurrentUser.execute();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Pregunta a la enciclopedia</h1>
          <p className="mt-4 text-muted">
            La respuesta sale solo del contenido revisado de la web, y cada dato enlaza al sitio donde se habla de ello.
          </p>
          <div className="mt-10">
            {user ? (
              <AskForm action={askEncyclopedia} />
            ) : (
              <SignInToSave label="Inicia sesión para preguntar" hint="Es gratis y solo necesitas un email." returnTo="/preguntar" />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
