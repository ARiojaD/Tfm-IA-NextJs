import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Greca } from "@/components/Greca";

// La cabecera común de las páginas, con el estilo "Aurora y piedra" de la portada: una foto velada de fondo
// (la foto se intuye, pero el texto se lee siempre, en claro y en oscuro), el resplandor de aurora y una
// greca al pie. Por defecto sube por detrás de la barra de navegación, que es transparente; cuando hay algo
// entre la barra y la cabecera (el aviso de la vista previa del panel), `underHeader` se apaga.
export function PageHero({
  image,
  width = "max-w-6xl",
  padding = "pb-14 pt-10 sm:pt-16",
  underHeader = true,
  children,
}: {
  image?: string;
  width?: string;
  padding?: string;
  underHeader?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`relative isolate overflow-hidden ${underHeader ? "-mt-20 pt-20" : ""}`}>
      {image && <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/88 to-background" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 -top-32 -z-10 mx-auto h-80 max-w-4xl rounded-full bg-gradient-to-r from-dawn-from to-dawn-to opacity-50 blur-3xl"
        aria-hidden="true"
      />
      <div className={`relative mx-auto ${width} px-4 sm:px-6 ${padding}`}>{children}</div>
      <Greca />
    </section>
  );
}

// La ruta de navegación de una página ("Inicio / Roma / Cronología completa"). El último elemento es la
// página actual y no lleva enlace.
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-8 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// El rótulo en capitulares romanas que va encima de algunos títulos ("Administración", "Tu cuenta").
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-4 font-display text-sm font-medium uppercase tracking-[0.3em] text-accent">{children}</p>;
}
