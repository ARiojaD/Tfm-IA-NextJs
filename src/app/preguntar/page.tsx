import type { Metadata } from "next";
import { AskForm } from "@/components/ask/AskForm";
import { SignInToSave } from "@/components/library/SignInToSave";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getContainer } from "@/composition/container";
import { askEncyclopedia } from "./actions";

export const metadata: Metadata = { title: "Preguntar · MemnonHistory AI" };

// Preguntar exige una cuenta (lo comprueba el caso de uso): los visitantes ven qué es y cómo entrar. La
// pregunta puede llegar escrita desde la portada (?q=…); solo rellena el formulario, no se envía sola, y al
// volver de iniciar sesión se conserva.
const QUESTION_MAX_LENGTH = 300;

export default async function AskPage({ searchParams }: PageProps<"/preguntar">) {
  const user = await getContainer().getCurrentUser.execute();
  const { q } = await searchParams;
  const question = typeof q === "string" ? q.trim().slice(0, QUESTION_MAX_LENGTH) : "";
  const returnTo = question ? `/preguntar?q=${encodeURIComponent(question)}` : "/preguntar";

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
              <AskForm action={askEncyclopedia} initialQuestion={question} />
            ) : (
              <SignInToSave label="Inicia sesión para preguntar" hint="Es gratis y solo necesitas un email." returnTo={returnTo} />
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
