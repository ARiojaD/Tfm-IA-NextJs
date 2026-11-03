import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { getContainer } from "@/composition/container";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "/#civilizaciones", label: "Civilizaciones" },
  { href: "/#cronologia", label: "Cronología" },
  { href: "/#consulta", label: "Consulta" },
];

// Shows who is signed in (their display name, never the email) or the links to sign in and sign up.
export async function SiteHeader() {
  const user = await getContainer().getCurrentUser.execute();

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Link href="/" className="font-serif text-xl font-bold tracking-tight">
        Memnon<span className="text-accent">History</span> AI
      </Link>
      <div className="flex items-center gap-4 sm:gap-6">
        <nav aria-label="Principal" className="hidden gap-6 text-sm text-muted md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-muted sm:inline">
              Hola, <span className="font-medium text-foreground">{user.name}</span>
            </span>
            <Link href="/mi-biblioteca" className="font-medium hover:text-accent">
              Mi biblioteca
            </Link>
            {/* Only a shortcut: the panel's use cases check the role on their own. */}
            {user.isAdmin && (
              <Link href="/admin" className="font-medium hover:text-accent">
                Panel
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-border px-3 py-1.5 font-medium transition-colors hover:border-foreground/30"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/iniciar-sesion" className="font-medium hover:text-accent">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="rounded-full bg-foreground px-3 py-1.5 font-medium text-background transition-opacity hover:opacity-85"
            >
              Crear cuenta
            </Link>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
