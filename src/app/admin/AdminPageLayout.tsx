import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

// Frame of the panel's inner pages: a way back to the panel, the title and the content.
export function AdminPageLayout({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
          <Link href="/admin" className="text-sm text-muted hover:text-foreground">
            ← Volver al panel
          </Link>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{title}</h1>
          {intro && <div className="mt-4 text-muted">{intro}</div>}
          <div className="mt-10 space-y-10">{children}</div>
        </div>
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
