import Link from "next/link";
import { Eyebrow, PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HERO_IMAGE } from "@/lib/eraImages";

// La página 404, con la misma cabecera que el resto. Es también lo que ve una cuenta normal al entrar en el
// panel, así que no dice nada de él.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageHero image={HERO_IMAGE} width="max-w-2xl" padding="pb-24 pt-16 sm:pt-24">
          <div className="text-center">
            <Eyebrow>Error 404</Eyebrow>
            <h1 className="font-serif text-5xl font-semibold tracking-tight sm:text-6xl">Perdido en la historia</h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              La página que buscas no existe o todavía no se ha escrito. Puede que el tema aún no esté disponible.
            </p>
            <Link
              href="/#civilizaciones"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Ver las civilizaciones
            </Link>
          </div>
        </PageHero>
      </main>
      <SiteFooter />
    </>
  );
}
