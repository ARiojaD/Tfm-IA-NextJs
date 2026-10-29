import type { ReactNode } from "react";
import { SiteFooter } from "../SiteFooter";
import { SiteHeader } from "../SiteHeader";

// Shared frame of the sign-in and sign-up pages: a centred card with a title.
export function AuthPageLayout({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-start justify-center px-4 pb-20 pt-10 sm:pt-16">
        <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
