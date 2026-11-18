import Link from "next/link";

// Se muestra a los visitantes sin sesión en lugar del formulario de comentarios. Los dos enlaces vuelven a la conversación.
export function SignInToComment({ returnTo }: { returnTo: string }) {
  const volver = encodeURIComponent(`${returnTo}#comunidad`);

  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-5 text-sm">
      <p className="text-muted">Para comentar necesitas una cuenta. Así cada comentario lleva la firma de su autor.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/iniciar-sesion?volver=${volver}`}
          className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-5 font-medium text-background transition-opacity hover:opacity-85"
        >
          Inicia sesión para comentar
        </Link>
        <Link href={`/registro?volver=${volver}`} className="font-medium text-accent hover:underline">
          o crea una cuenta
        </Link>
      </div>
    </div>
  );
}
