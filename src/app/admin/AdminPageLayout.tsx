import Link from "next/link";
import type { ReactNode } from "react";
import { PageHero } from "@/components/PageHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { HERO_IMAGE } from "@/lib/eraImages";

// El marco de las páginas interiores del panel: la cabecera común (con el rótulo "Administración" y la
// vuelta al panel), el título y el contenido.
export function AdminPageLayout({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PageHero image={HERO_IMAGE} width="max-w-3xl">
          <Link href="/admin" className="text-sm text-muted hover:text-foreground">
            ← Volver al panel
          </Link>
          <p className="mt-6 font-display text-sm font-medium uppercase tracking-[0.3em] text-accent">Administración</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{title}</h1>
          {intro && <div className="mt-4 text-muted">{intro}</div>}
        </PageHero>
        <div className="mx-auto max-w-3xl space-y-10 px-4 pb-20 pt-12 sm:px-6">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}

// One section of the editor, with its own heading (and its own save button inside).
export function AdminSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  const id = `seccion-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section aria-labelledby={id} className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
      <h2 id={id} className="font-serif text-2xl font-semibold">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
