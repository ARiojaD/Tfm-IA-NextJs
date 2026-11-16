import type { ReactNode } from "react";
import { Eyebrow, PageHero } from "../PageHero";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";
import { HERO_IMAGE } from "@/lib/eraImages";

// El marco común de las páginas de iniciar sesión y crear cuenta: una tarjeta centrada con su título, sobre
// el Foro velado de la cabecera común. La tarjeta es casi opaca para que el formulario se lea siempre.
export function AuthPageLayout({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageHero image={HERO_IMAGE} width="max-w-md" padding="pb-20 pt-10 sm:pt-16">
          <div className="rounded-3xl border border-border bg-surface/95 p-6 backdrop-blur sm:p-8">
            <Eyebrow>Tu cuenta</Eyebrow>
            <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
            <div className="mt-8">{children}</div>
          </div>
        </PageHero>
      </main>
      <SiteFooter />
    </>
  );
}
