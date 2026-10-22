import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">Error 404</p>
        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight">Perdido en la historia</h1>
        <p className="mt-4 leading-7 text-muted">
          La página que buscas no existe o todavía no se ha escrito. Puede que el tema aún no esté disponible.
        </p>
        <Link
          href="/#civilizaciones"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Ver las civilizaciones
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
