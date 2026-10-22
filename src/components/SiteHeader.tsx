import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/#civilizaciones", label: "Civilizaciones" },
  { href: "/#cronologia", label: "Cronología" },
  { href: "/#consulta", label: "Consulta" },
];

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link href="/" className="font-serif text-xl font-bold tracking-tight">
        Memnon<span className="text-accent">History</span> AI
      </Link>
      <div className="flex items-center gap-6">
        <nav aria-label="Principal" className="hidden gap-6 text-sm text-muted sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
