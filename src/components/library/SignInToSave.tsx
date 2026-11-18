import Link from "next/link";

// Lo que ven los visitantes sin sesión en lugar de los botones «Seguir» / «Guardar»: el mismo botón, que
// lleva a iniciar sesión y de vuelta aquí, con una línea sobre lo que aporta tener cuenta.
export function SignInToSave({ label, hint, returnTo }: { label: string; hint: string; returnTo: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={`/iniciar-sesion?volver=${encodeURIComponent(returnTo)}`}
        className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
      >
        {label}
      </Link>
      <p className="text-sm text-muted">{hint}</p>
    </div>
  );
}
